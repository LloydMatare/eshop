import ProductItem from "@/components/products/ProductItem";
import getBanners, { getBannerById } from "@/lib/services/bannerServices";
import productService from "@/lib/services/productService";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) return { title: "Banner not found" };
  return { title: banner.name };
}

export default async function BannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBannerById(id);

  if (!banner) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Banner not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const products = banner.category
    ? await productService.getProductsByCategory(banner.category)
    : [];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Banner Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.image}
          alt={banner.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent">
          <div className="container mx-auto flex h-full items-center px-4">
            <div className="max-w-2xl text-white">
              <h1 className="mb-4 text-5xl font-bold drop-shadow-2xl">
                {banner.name}
              </h1>
              {banner.category && (
                <p className="mb-6 text-xl text-white/90 drop-shadow-md">
                  {banner.category}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Related Products */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {products.length > 0 ? (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full" />
              <h2 className="text-3xl font-bold text-base-content">
                Products in this Collection
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => (
                <ProductItem key={product.slug} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-base-content/60">
            <p className="text-xl">
              No products are currently associated with this banner.
            </p>
            <p className="mt-2">
              Assign a category to this banner in the admin panel to display
              related products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
