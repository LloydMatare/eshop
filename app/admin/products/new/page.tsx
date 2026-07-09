import AdminLayout from '@/components/admin/AdminLayout'
import Form from '../[id]/Form'

export const metadata = {
  title: 'Create Product',
}

export default function CreateProductPage() {
  return (
    <AdminLayout activeItem="products">
      <Form productId="new" />
    </AdminLayout>
  )
}
