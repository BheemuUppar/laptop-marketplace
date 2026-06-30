import { BRAND_LOGOS, DEFAULT_BRAND_LOGO } from '../constants/store.constants';
import { slugifyBrand } from '../models/master.model';

export interface BrandCard {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export function buildBrandCards(names: string[]): BrandCard[] {
  return names.map((name, index) => {
    const slug = slugifyBrand(name);
    return {
      id: `${slug}-${index}`,
      name,
      slug,
      logo: BRAND_LOGOS[slug] ?? DEFAULT_BRAND_LOGO,
    };
  });
}

export function parseWarrantyMonths(warranty: string): number {
  const value = warranty.trim().toLowerCase();
  if (!value || value.includes('no warranty')) return 0;
  const match = value.match(/(\d+)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (value.includes('year')) return amount * 12;
  return amount;
}
