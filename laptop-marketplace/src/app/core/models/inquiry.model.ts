export type InquiryStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Inquiry {
  id: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  productId?: string;
  interestedProduct?: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface ContactFormData {
  name: string;
  mobile: string;
  email: string;
  message: string;
  productId?: string;
  interestedProduct?: string;
}

export function mapApiInquiry(doc: Record<string, unknown>): Inquiry {
  return {
    id: (doc['_id'] as string) ?? (doc['id'] as string),
    name: doc['name'] as string,
    mobile: doc['mobile'] as string,
    email: doc['email'] as string,
    message: doc['message'] as string,
    productId: doc['productId'] as string | undefined,
    status: doc['status'] as InquiryStatus,
    createdAt: doc['createdAt'] as string,
  };
}
