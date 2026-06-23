'use client';

import { use } from 'react';
import { useUser } from '@clerk/nextjs';
import OrderTracking from '@/components/OrderTracking';
import OrderDetails from './OrderDetails';

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useUser();

  const session = user
    ? { user: { isAdmin: user?.publicMetadata?.isAdmin === true } }
    : null;

  return (
    <div>
      <OrderDetails
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        orderId={id}
      />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <OrderTracking orderId={id} session={session} />
      </div>
    </div>
  );
}
