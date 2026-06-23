export type Banner = {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Product = {
  id: string;
  part: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  colors?: string[];
  sizes?: string[];
  isFeatured?: boolean;
  tracking?: { status: string; timestamp: string; message?: string }[];
};

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
  color?: string;
  size?: string;
}
