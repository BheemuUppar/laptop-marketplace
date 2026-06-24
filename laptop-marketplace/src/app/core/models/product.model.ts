export type ProductCondition = 'Excellent' | 'Good' | 'Fair';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  brand: string;
  model: string;
  slug: string;
  processor: string;
  generation: string;
  ram: string;
  storage: string;
  graphics: string;
  displaySize: string;
  batteryHealth: number;
  condition: ProductCondition;
  warrantyMonths: number;
  quantityAvailable: number;
  sellingPrice: number;
  originalPrice?: number;
  description: string;
  images: string[];
  featured: boolean;
  isAvailable: boolean;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  processor?: string;
  ram?: string;
  storage?: string;
  condition?: ProductCondition;
  availability?: StockStatus;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
}

export interface ProductFormData {
  brand: string;
  model: string;
  processor: string;
  generation: string;
  ram: string;
  storage: string;
  graphics: string;
  displaySize: string;
  batteryHealth: number;
  condition: ProductCondition;
  warrantyMonths: number;
  quantityAvailable: number;
  sellingPrice: number;
  originalPrice?: number;
  description: string;
  images: string[];
  featured: boolean;
  isAvailable: boolean;
}

/** Map MongoDB document to frontend Product */
export function mapApiProduct(doc: Record<string, unknown>): Product {
  const qty = (doc['quantityAvailable'] as number) ?? 0;
  const isAvailable = (doc['isAvailable'] as boolean) ?? true;
  return {
    id: (doc['_id'] as string) ?? (doc['id'] as string),
    brand: doc['brand'] as string,
    model: doc['model'] as string,
    slug: doc['slug'] as string,
    processor: doc['processor'] as string,
    generation: doc['generation'] as string,
    ram: doc['ram'] as string,
    storage: doc['storage'] as string,
    graphics: (doc['graphics'] as string) ?? '',
    displaySize: doc['displaySize'] as string,
    batteryHealth: doc['batteryHealth'] as number,
    condition: doc['condition'] as ProductCondition,
    warrantyMonths: doc['warrantyMonths'] as number,
    quantityAvailable: qty,
    sellingPrice: doc['sellingPrice'] as number,
    originalPrice: doc['originalPrice'] as number | undefined,
    description: doc['description'] as string,
    images: (doc['images'] as string[]) ?? [],
    featured: (doc['featured'] as boolean) ?? false,
    isAvailable,
    stockStatus: calcStockStatus(qty, isAvailable),
    createdAt: doc['createdAt'] as string,
    updatedAt: doc['updatedAt'] as string,
  };
}

export function calcStockStatus(qty: number, isAvailable: boolean): StockStatus {
  if (!isAvailable || qty === 0) return 'out_of_stock';
  if (qty <= 3) return 'low_stock';
  return 'in_stock';
}
