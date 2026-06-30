import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly isEdit = signal(false);
  private reviewId = '';

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    customerRole: [''],
    customerCompany: [''],
    customerImage: [''],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    reviewText: ['', [Validators.required, Validators.minLength(10)]],
    isVisible: [true],
    isFeatured: [false],
    displayOrder: [0, [Validators.min(0)]],
  });

  readonly ratings = [5, 4, 3, 2, 1];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.reviewId = id;
      this.seo.update({ title: 'Edit Review - Admin', description: 'Edit customer testimonial' });
      this.loadReview(id);
    } else {
      this.seo.update({ title: 'Add Review - Admin', description: 'Add customer testimonial' });
    }
  }

  loadReview(id: string): void {
    this.loading.set(true);
    this.reviewService.getByIdAdmin(id).subscribe({
      next: review => {
        this.form.patchValue({
          customerName: review.customerName,
          customerRole: review.customerRole || '',
          customerCompany: review.customerCompany || '',
          customerImage: review.customerImage || '',
          rating: review.rating,
          reviewText: review.reviewText,
          isVisible: review.isVisible,
          isFeatured: review.isFeatured,
          displayOrder: review.displayOrder,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.saveError.set('Review not found.');
        setTimeout(() => this.router.navigate(['/admin/reviews']), 1500);
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  save(): void {
    this.saveError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request$ = this.isEdit()
      ? this.reviewService.update(this.reviewId, payload)
      : this.reviewService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/reviews']);
      },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || 'Failed to save review. Please try again.');
      },
    });
  }
}
