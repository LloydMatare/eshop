import { Metadata } from "next";
import Form from "./Form.tsx";

export const metadata: Metadata = {
  title: "Shipping Address",
};

export default async function ShippingPage() {
  return <Form />;
}
