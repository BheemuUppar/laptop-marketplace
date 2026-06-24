export interface StoreInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  businessHours: BusinessHours[];
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  latitude: number;
  longitude: number;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface StoreStats {
  laptopsSold: number;
  happyCustomers: number;
  availableInventory: number;
  yearsInBusiness: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  slug: string;
  productCount: number;
}
