/**
 * Future API endpoints - swap mock services for HTTP calls when backend is ready.
 * Backend: Node.js + Express + MongoDB on Render
 */
export const API_ENDPOINTS = {
  products: '/products',
  productById: (id: string) => `/products/${id}`,
  productBySlug: (slug: string) => `/products/slug/${slug}`,
  reviews: '/reviews',
  adminReviews: '/admin/reviews',
  inquiries: '/inquiries',
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  orders: '/orders',
  cart: '/cart',
  wishlist: '/wishlist',
  payments: {
    razorpay: '/payments/razorpay',
    phonepe: '/payments/phonepe',
    verify: '/payments/verify',
  },
  bookings: '/bookings',
  coupons: '/coupons',
  emi: '/emi-plans',
  analytics: '/admin/analytics',
} as const;
