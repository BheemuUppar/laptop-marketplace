export const MASTER_TYPES = [
  'brand',
  'processor',
  'ram',
  'storage',
  'graphics',
  'screenSize',
  'condition',
  'os',
  'laptopType',
  'warranty',
  'color',
] as const;

export type MasterType = (typeof MASTER_TYPES)[number];

export const MASTER_TYPE_LABELS: Record<MasterType, string> = {
  brand: 'Brands',
  processor: 'Processors',
  ram: 'RAM',
  storage: 'Storage',
  graphics: 'Graphics',
  screenSize: 'Screen Size',
  condition: 'Condition',
  os: 'Operating System',
  laptopType: 'Laptop Type',
  warranty: 'Warranty',
  color: 'Color',
};

export const MASTER_TYPE_SINGULAR: Record<MasterType, string> = {
  brand: 'Brand',
  processor: 'Processor',
  ram: 'RAM Option',
  storage: 'Storage Option',
  graphics: 'Graphics Card',
  screenSize: 'Screen Size',
  condition: 'Condition',
  os: 'Operating System',
  laptopType: 'Laptop Type',
  warranty: 'Warranty',
  color: 'Color',
};

export interface Master {
  id: string;
  type: MasterType;
  value: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MastersGrouped = Record<MasterType, Master[]>;

export type MasterCounts = Record<MasterType, number>;

export type MasterAdminCounts = Record<MasterType, { total: number; active: number }>;

export interface MasterListResponse {
  items: Master[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MasterFormData {
  type: MasterType;
  value: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export function isMasterType(value: string): value is MasterType {
  return (MASTER_TYPES as readonly string[]).includes(value);
}

export function slugifyBrand(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
