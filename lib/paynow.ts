//@ts-ignore
import { Paynow } from "paynow";

function createInstance() {
  return new Paynow(
    process.env.NEXT_PUBLIC_PAYNOW_ID!,
    process.env.NEXT_PUBLIC_PAYNOW_KEY!
  );
}

export const paynow = {
  createPayNowOrder: async function createPayNowOrder(
    orderId: string,
    amount: number
  ) {
    const instance = createInstance();

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    instance.resultUrl = `${baseUrl}/api/orders/${orderId}/verify-paynow`;
    instance.returnUrl = `${baseUrl}/order/${orderId}`;

    const payment = instance.createPayment(`Invoice_${orderId}`);
    payment.add(`Order ${orderId}`, amount);

    try {
      const response = await instance.send(payment);

      if (!response) {
        throw new Error("PayNow API returned no response (check integration credentials and network connectivity)");
      }

      if (response.success) {
        return {
          link: response.redirectUrl,
          pollUrl: response.pollUrl,
        };
      } else {
        throw new Error(response.error ? `PayNow error: ${response.error}` : "Failed to create PayNow payment");
      }
    } catch (error) {
      console.error("Error in createPayNowOrder:", error);
      throw error;
    }
  },

  capturePayNowOrder: async function capturePayNowOrder(pollUrl: string) {
    const instance = createInstance();

    try {
      let paymentStatus;
      let retryCount = 0;
      const maxRetries = 5;

      while (retryCount < maxRetries) {
        paymentStatus = await instance.pollTransaction(pollUrl);
        console.log("Payment status received:", paymentStatus);

        if (!paymentStatus) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        if (paymentStatus.status === "paid") {
          break;
        }
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (!paymentStatus || paymentStatus.status !== "paid") {
        console.error("Payment not completed after retries");
        return { success: false, message: "Payment not completed" };
      }

      return {
        success: true,
        id: paymentStatus.transactionId,
        paidAt: paymentStatus.paidAt,
        paymentDetails: paymentStatus,
      };
    } catch (error) {
      console.error("Error in capturePayNowOrder:", error);
      throw error;
    }
  },
};
