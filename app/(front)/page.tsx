import ProductItem from "@/components/products/ProductItem";
import HeroCarousel from "@/components/HeroCarousel";
import getBanners from "@/lib/services/bannerServices";
import productService from "@/lib/services/productService";

export default async function Home() {
  const featuredProducts = await getBanners();
  const latestProducts = await productService.getLatest();
  const categories = await productService.getCategories();

  const categoryProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await productService.getProductsByCategory(category);
      return { category, products };
    })
  );

  console.log("Products  : ", latestProducts);

  return (
    <>
      {/* Full-Width Hero Banner Section */}
      <HeroCarousel banners={featuredProducts} />

      {/* Tech Stats Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-sm lg:text-base opacity-90">IT Products</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
              <div className="text-sm lg:text-base opacity-90">Support</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-sm lg:text-base opacity-90">
                Happy Clients
              </div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">99%</div>
              <div className="text-sm lg:text-base opacity-90">
                Satisfaction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Products Section */}
      <section className="container mx-auto px-4 mt-16 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Latest IT Solutions
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestProducts.map((product: any) => (
            <ProductItem
              key={product.slug}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Category Products Sections */}
      {categoryProducts.map((categoryProduct, idx) => (
        <section
          key={categoryProduct.category}
          className="container mx-auto px-4 mt-16 mb-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 w-12 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
            <h2 className="text-4xl font-bold text-base-content">
              {categoryProduct.category}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProduct.products.map((product: any) => (
              <ProductItem
                key={product.slug}
                product={product}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
