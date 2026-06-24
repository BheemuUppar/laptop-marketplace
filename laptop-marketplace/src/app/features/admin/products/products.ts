import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { SeoService } from '../../../core/services/seo';
import { Product, ProductFormData, ProductCondition } from '../../../core/models/product.model';
import { FILTER_OPTIONS } from '../../../core/constants/store.constants';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80';

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly saveError = signal('');
  readonly options = FILTER_OPTIONS;
  readonly imagePreview = signal<string[]>([]);
  readonly selectedFiles = signal<File[]>([]);

  readonly form = this.fb.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    processor: ['', Validators.required],
    generation: [''],
    ram: [this.options.ram[0], Validators.required],
    storage: [this.options.storage[0], Validators.required],
    graphics: [''],
    displaySize: ['', Validators.required],
    batteryHealth: [85, [Validators.min(0), Validators.max(100)]],
    condition: ['Excellent' as ProductCondition, Validators.required],
    warrantyMonths: [3, [Validators.min(0)]],
    sellingPrice: [null as number | null, [Validators.required, Validators.min(1)]],
    originalPrice: [null as number | null],
    quantityAvailable: [1, [Validators.required, Validators.min(0)]],
    description: [''],
    featured: [false],
    isAvailable: [true],
  });

  ngOnInit(): void {
    this.seo.update({ title: 'Manage Products', description: 'iPro Technologies product management' });
    this.loadProducts();
  }

  filteredProducts(): Product[] {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p => p.model.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.saveError.set('');
    this.imagePreview.set([]);
    this.selectedFiles.set([]);
    this.form.reset({
      brand: '',
      model: '',
      processor: '',
      generation: '',
      ram: this.options.ram[0],
      storage: this.options.storage[0],
      graphics: '',
      displaySize: '',
      batteryHealth: 85,
      condition: 'Excellent',
      warrantyMonths: 3,
      sellingPrice: null,
      originalPrice: null,
      quantityAvailable: 1,
      description: '',
      featured: false,
      isAvailable: true,
    });
    this.showModal.set(true);
  }

  openEditModal(product: Product): void {
    this.editingId.set(product.id);
    this.saveError.set('');
    this.imagePreview.set([...product.images]);
    this.selectedFiles.set([]);
    this.form.patchValue({
      brand: product.brand,
      model: product.model,
      processor: product.processor,
      generation: product.generation,
      ram: product.ram,
      storage: product.storage,
      graphics: product.graphics,
      displaySize: product.displaySize,
      batteryHealth: product.batteryHealth,
      condition: product.condition,
      warrantyMonths: product.warrantyMonths,
      sellingPrice: product.sellingPrice,
      originalPrice: product.originalPrice ?? null,
      quantityAvailable: product.quantityAvailable,
      description: product.description,
      featured: product.featured,
      isAvailable: product.isAvailable,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.saveError.set('');
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    this.selectedFiles.update(existing => [...existing, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.update(imgs => [...imgs, reader.result as string]);
      reader.readAsDataURL(f);
    });
  }

  removeImage(index: number): void {
    this.imagePreview.update(imgs => imgs.filter((_, i) => i !== index));
    if (index < this.selectedFiles().length) {
      this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    }
  }

  saveProduct(): void {
    this.saveError.set('');

    // Default optional numeric fields if left empty
    if (this.form.get('batteryHealth')?.value == null) {
      this.form.patchValue({ batteryHealth: 85 });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const missing = this.getInvalidFields();
      this.saveError.set(`Please fill required fields: ${missing.join(', ')}`);
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const existingImages = this.imagePreview().filter(url => url.startsWith('http'));
    const newFiles = this.selectedFiles();

    const save = (images: string[]) => {
      const finalImages = images.length ? images : [DEFAULT_IMAGE];

      const data: ProductFormData = {
        brand: raw.brand!,
        model: raw.model!,
        processor: raw.processor!,
        generation: raw.generation ?? '',
        ram: raw.ram!,
        storage: raw.storage!,
        graphics: raw.graphics ?? '',
        displaySize: raw.displaySize!,
        batteryHealth: Number(raw.batteryHealth) || 85,
        condition: raw.condition!,
        warrantyMonths: Number(raw.warrantyMonths) || 0,
        sellingPrice: Number(raw.sellingPrice),
        originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined,
        quantityAvailable: Number(raw.quantityAvailable),
        description: raw.description ?? '',
        images: finalImages,
        featured: !!raw.featured,
        isAvailable: !!raw.isAvailable,
      };

      const id = this.editingId();
      const request = id
        ? this.productService.updateProduct(id, data)
        : this.productService.addProduct(data);

      request.subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadProducts();
          this.productService.refreshStats().subscribe();
        },
        error: (err) => {
          this.saving.set(false);
          this.saveError.set(err?.error?.message || 'Failed to save product. Please try again.');
        },
      });
    };

    if (newFiles.length) {
      this.uploading.set(true);
      this.productService.uploadImages(newFiles).subscribe({
        next: res => {
          this.uploading.set(false);
          const urls = res.urls;
          if (!urls?.length) {
            this.saving.set(false);
            this.saveError.set('Image upload failed. Please try again.');
            return;
          }
          save([...existingImages, ...urls]);
        },
        error: err => {
          this.uploading.set(false);
          this.saving.set(false);
          this.saveError.set(err?.error?.message || 'Image upload failed. Please try again.');
        },
      });
    } else {
      save(existingImages.length ? existingImages : [DEFAULT_IMAGE]);
    }
  }

  deleteProduct(id: string): void {
    if (!confirm('Delete this product permanently?')) return;
    this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
  }

  markSold(id: string): void {
    this.productService.markSold(id).subscribe(() => this.loadProducts());
  }

  toggleAvailability(id: string): void {
    this.productService.toggleAvailability(id).subscribe(() => this.loadProducts());
  }

  stockBadgeClass(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'badge-success';
      case 'low_stock':
        return 'badge-warning';
      default:
        return 'badge-danger';
    }
  }

  private getInvalidFields(): string[] {
    const labels: Record<string, string> = {
      brand: 'Brand',
      model: 'Model',
      processor: 'Processor',
      ram: 'RAM',
      storage: 'Storage',
      displaySize: 'Display Size',
      batteryHealth: 'Battery Health (0–100)',
      condition: 'Condition',
      sellingPrice: 'Selling Price',
      quantityAvailable: 'Quantity',
    };
    return Object.keys(this.form.controls)
      .filter(key => this.form.get(key)?.invalid)
      .map(key => labels[key] || key);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllAdmin().subscribe(products => {
      this.products.set(products);
      this.loading.set(false);
    });
  }
}
