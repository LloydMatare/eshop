import Tracking from "@/components/UpdateTracking";


const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return (
        <div>
            <h1>Product Details</h1>
            <Tracking productId={id} />
        </div>
    );
};

export default ProductPage;
