import { cache } from "react";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";

const getBanners = cache(async () => {
  const result = await db.select().from(banners).limit(3);
  return result as any[];
});

export default getBanners;
