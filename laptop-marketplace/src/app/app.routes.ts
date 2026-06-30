import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
      { path: 'laptops', loadComponent: () => import('./features/browse/browse').then(m => m.Browse) },
      { path: 'laptops/:slug', loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail) },
      { path: 'brands', loadComponent: () => import('./features/brands/brands').then(m => m.Brands) },
      { path: 'reviews', loadComponent: () => import('./features/reviews/reviews').then(m => m.Reviews) },
      { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.About) },
      { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.Contact) },
      { path: 'store-location', loadComponent: () => import('./features/store-location/store-location').then(m => m.StoreLocation) },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then(m => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'products', loadComponent: () => import('./features/admin/products/products').then(m => m.Products) },
      { path: 'inventory', loadComponent: () => import('./features/admin/inventory/inventory').then(m => m.Inventory) },
      { path: 'inquiries', loadComponent: () => import('./features/admin/inquiries/inquiries').then(m => m.Inquiries) },
      { path: 'reviews', loadComponent: () => import('./features/admin/reviews/reviews').then(m => m.AdminReviews) },
      { path: 'reviews/new', loadComponent: () => import('./features/admin/reviews/review-form').then(m => m.ReviewForm) },
      { path: 'reviews/:id/edit', loadComponent: () => import('./features/admin/reviews/review-form').then(m => m.ReviewForm) },
      { path: 'gallery', loadComponent: () => import('./features/admin/gallery/gallery').then(m => m.AdminGallery) },
    ],
  },
  { path: '**', redirectTo: '' },
];
