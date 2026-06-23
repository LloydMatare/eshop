import AdminLayout from '@/components/admin/AdminLayout'
import Form from './Form'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: `Edit Banner ${id}`,
    }
}

export default async function BannerEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    return (
        <AdminLayout activeItem="banners">
            <Form bannerId={id} />
        </AdminLayout>
    )
}
