export interface Review {
  id: string;
  customerName: string;
  customerRole?: string;
  customerCompany?: string;
  customerImage?: string;
  rating: number;
  reviewText: string;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  customerName: string;
  customerRole?: string;
  customerCompany?: string;
  customerImage?: string;
  rating: number;
  reviewText: string;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface ReviewStats {
  total: number;
  visible: number;
  featured: number;
  hidden: number;
}

export type ReviewSortOption = 'latest' | 'highest' | 'lowest';

export interface ReviewFilter {
  search?: string;
  rating?: number;
  sortBy?: ReviewSortOption;
}
