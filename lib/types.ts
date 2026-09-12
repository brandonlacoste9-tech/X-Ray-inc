export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductVariant = {
  stockNumber: string;
  label: string;
  price: number | null;
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  stockNumber: string;
  category: string;
  subcategory: string;
  price: number | null;
  unit: string;
  options: ProductOption[];
  specs: ProductSpec[];
  variants?: ProductVariant[];
  description: string;
  image: string;
  gallery?: string[];
  featured?: boolean;
  tags: string[];
  sourceUrl?: string;
};

export type CategoryNode = {
  slug: string;
  name: string;
  description: string;
  href: string;
  children?: CategoryNode[];
};

export type BrandHub = {
  slug: string;
  name: string;
  description: string;
  specialties: string[];
};
