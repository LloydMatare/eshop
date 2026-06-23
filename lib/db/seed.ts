import { db } from "./index";
import { users, products, banners } from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const seedUsers = [
  { id: "user_2r0BVyh4a62aSLFk7tFj4oD0nFh", name: "Admin", email: "admin@example.com", isAdmin: true },
  { id: "user_2r0BVyh4a62aSLFk7tFj4oD0nFg", name: "User", email: "user@example.com", isAdmin: false },
];

const seedProducts = [
  {
    id: "prod_001", part: "LAP-001", name: "Dell Latitude 7430 Business Laptop",
    slug: "dell-latitude-7430-business-laptop", category: "Laptops & Computers",
    image: "/images/dell-laptop.png", price: "1299.99", brand: "Dell",
    rating: "4.8", numReviews: 156, countInStock: 15,
    description: "14-inch enterprise laptop with Intel Core i7-1265U, 16GB RAM, 512GB NVMe SSD.",
    isFeatured: true,
  },
  {
    id: "prod_002", part: "LAP-002", name: "HP EliteBook 840 G9 Workstation",
    slug: "hp-elitebook-840-g9-workstation", category: "Laptops & Computers",
    image: "/images/ai3.png", price: "1499.99", brand: "HP",
    rating: "4.7", numReviews: 134, countInStock: 12,
    description: "Premium business laptop featuring 12th Gen Intel Core i7, 32GB DDR5 RAM.",
    isFeatured: true,
  },
  {
    id: "prod_003", part: "DES-001", name: "Dell OptiPlex 7090 Desktop Tower",
    slug: "dell-optiplex-7090-desktop", category: "Laptops & Computers",
    image: "/images/optiplex.png", price: "899.99", brand: "Dell",
    rating: "4.6", numReviews: 89, countInStock: 25,
    description: "Reliable desktop computer with Intel Core i5-11500, 16GB RAM.",
  },
  {
    id: "prod_004", part: "WKS-001", name: "HP Z2 G9 Tower Workstation",
    slug: "hp-z2-g9-tower-workstation", category: "Laptops & Computers",
    image: "/images/hp-z2.png", price: "2199.99", brand: "HP",
    rating: "4.9", numReviews: 67, countInStock: 8,
    description: "Professional workstation with Intel Xeon processor, 64GB ECC RAM.",
    isFeatured: true,
  },
  {
    id: "prod_005", part: "MAC-001", name: "Apple MacBook Pro 14-inch M3 Pro",
    slug: "macbook-pro-14-m3-pro", category: "Laptops & Computers",
    image: "/images/apple.png", price: "1999.99", brand: "Apple",
    rating: "4.9", numReviews: 234, countInStock: 18,
    description: "Powerful laptop with M3 Pro chip, 18GB unified memory.",
  },
  {
    id: "prod_006", part: "SRV-001", name: "Dell PowerEdge T150 Server",
    slug: "dell-poweredge-t150-server", category: "Servers & Storage",
    image: "/images/poweredge.png", price: "1599.99", brand: "Dell",
    rating: "4.7", numReviews: 45, countInStock: 10,
    description: "Entry-level tower server with Intel Xeon E-2314.",
  },
  {
    id: "prod_007", part: "SRV-002", name: "HPE ProLiant DL380 Gen10 Plus",
    slug: "hpe-proliant-dl380-gen10-plus", category: "Servers & Storage",
    image: "/images/unifi.png", price: "3499.99", brand: "HPE",
    rating: "4.8", numReviews: 78, countInStock: 6,
    description: "2U rack server with dual Intel Xeon Gold processors.",
    isFeatured: true,
  },
  {
    id: "prod_008", part: "NAS-001", name: "Synology DS923+ NAS Storage",
    slug: "synology-ds923-nas-storage", category: "Servers & Storage",
    image: "/images/synology.png", price: "599.99", brand: "Synology",
    rating: "4.8", numReviews: 167, countInStock: 22,
    description: "4-bay NAS with AMD Ryzen processor.",
  },
  {
    id: "prod_009", part: "NET-001", name: "Cisco Catalyst 1000-24T Switch",
    slug: "cisco-catalyst-1000-24t-switch", category: "Networking",
    image: "/images/cisco.png", price: "899.99", brand: "Cisco",
    rating: "4.6", numReviews: 89, countInStock: 18,
    description: "24-port Gigabit managed switch with 4x 1G SFP uplinks.",
  },
  {
    id: "prod_010", part: "NET-002", name: "Ubiquiti UniFi Dream Machine Pro",
    slug: "ubiquiti-unifi-dream-machine-pro", category: "Networking",
    image: "/images/unifi.png", price: "379.99", brand: "Ubiquiti",
    rating: "4.7", numReviews: 234, countInStock: 35,
    description: "All-in-one network appliance with routing, switching, security.",
    isFeatured: true,
  },
  {
    id: "prod_011", part: "SW-001", name: "Microsoft Windows Server 2022 Standard",
    slug: "windows-server-2022-standard", category: "Software & Licenses",
    image: "/images/windows-server-2022.png", price: "749.99", brand: "Microsoft",
    rating: "4.6", numReviews: 145, countInStock: 100,
    description: "Latest Windows Server operating system with 16-core license.",
  },
  {
    id: "prod_012", part: "SW-002", name: "VMware vSphere 8 Standard License",
    slug: "vmware-vsphere-8-standard", category: "Software & Licenses",
    image: "/images/vmware.png", price: "995.99", brand: "VMware",
    rating: "4.8", numReviews: 234, countInStock: 75,
    description: "Industry-leading virtualization platform.",
    isFeatured: true,
  },
];

const seedBanners = [
  { id: "banner_001", name: "Enterprise IT Solutions", slug: "enterprise-it-solutions", image: "/images/banner-1.jpg" },
  { id: "banner_002", name: "Cloud Infrastructure Deals", slug: "cloud-infrastructure-deals", image: "/images/banner-networks.jpg" },
  { id: "banner_003", name: "Business Laptop Specials", slug: "business-laptop-specials", image: "/images/banner-3.webp" },
];

async function seed() {
  try {
    console.log("Seeding database...");
    await db.insert(users).values(seedUsers).onConflictDoNothing();
    console.log(`Seeded ${seedUsers.length} users`);
    await db.insert(products).values(seedProducts).onConflictDoNothing();
    console.log(`Seeded ${seedProducts.length} products`);
    await db.insert(banners).values(seedBanners).onConflictDoNothing();
    console.log(`Seeded ${seedBanners.length} banners`);
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
