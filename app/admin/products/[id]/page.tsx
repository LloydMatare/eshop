import AdminLayout from '@/components/admin/AdminLayout'
import Form from './Form'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Edit Product ${id}`,
  }
}

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return (
    <AdminLayout activeItem="products">
      <Form productId={id} />
    </AdminLayout>
  )
}
