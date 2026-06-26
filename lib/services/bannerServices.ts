import { cache } from "react";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const getBanners = cache(async () => {
  const result = await db.select().from(banners).limit(3);
  return result as any[];
});

const getBannerById = cache(async (id: string) => {
  const result = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1)
    .then((r) => r[0]);
  return result as any;
});

export { getBannerById };
export default getBanners;
