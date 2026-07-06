'use client'
import { useState } from 'react';
import Modal from '@/components/Modal';
import useSWR from 'swr';
import { fetcher } from '@/lib/services/fetcher';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  'Order Received': <ShoppingBag className="w-5 h-5" />,
  'Paid': <CreditCard className="w-5 h-5" />,
  'Shipped': <Package className="w-5 h-5" />,
  'In Transit': <Truck className="w-5 h-5" />,
  'Out for Delivery': <Truck className="w-5 h-5" />,
  'Delivered': <CheckCircle className="w-5 h-5" />,
  'Collected': <MapPin className="w-5 h-5" />,
};

interface OrderTrackingProps {
  orderId: string;
  session: { user: { isAdmin: boolean } } | null;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, session }) => {
  const { data, error, isLoading, mutate } = useSWR(`/api/orders/${orderId}/tracking`, fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tracking: Array<{ status: string; timestamp: string; message?: string }> = data?.tracking || [];

  const handleUpdateTracking = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, message: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to update tracking');

      await mutate();
      setIsModalOpen(false);
      setNewStatus('');
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
        <div className="text-error">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">Tracking Information</h2>
        </div>
        {session?.user.isAdmin && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Update
          </button>
        )}
      </div>

      {tracking.length > 0 ? (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-base-300" />
          <ul className="space-y-6">
            {tracking.map((item, index) => (
              <li key={index} className="relative flex gap-4">
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 ${
                  index === 0
                    ? 'bg-primary border-primary text-primary-content'
                    : 'bg-base-100 border-base-300 text-base-content/60'
                }`}>
                  {statusIcons[item.status] || <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base-content">{item.status}</span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">Latest</Badge>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 mt-0.5">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  {item.message && (
                    <p className="text-sm text-base-content/70 mt-1 bg-base-100 rounded-lg p-2 border border-base-300">
                      {item.message}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <p className="text-base-content/60">No tracking data available yet</p>
        </div>
      )}

      {session?.user.isAdmin && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-bold">Add Tracking Update</h3>
          <div className="flex flex-col gap-4 mt-4">
            <select
              onChange={(e) => setNewStatus(e.target.value)}
              value={newStatus}
              className="border p-2 rounded"
            >
              <option value="">Select Status</option>
              <option value="Order Received">Order Received</option>
              <option value="Shipped">Shipped</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Collected">Collected</option>
            </select>
            <textarea
              placeholder="Message (optional)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="border p-2 rounded"
            ></textarea>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              onClick={handleUpdateTracking}
              disabled={submitting || !newStatus}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderTracking;
