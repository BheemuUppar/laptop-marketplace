import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReviewService } from '../../../core/services/review';
import { SeoService } from '../../../core/services/seo';
import { Review } from '../../../core/models/review.model';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { DeleteReviewDialog } from './delete-review-dialog';

@Component({
  selector: 'app-admin-reviews',
  imports: [
    RouterLink,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    StarRating,
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class AdminReviews implements OnInit, AfterViewInit {
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<Review>([]);

  readonly displayedColumns = [
    'customerName',
    'rating',
    'reviewPreview',
    'isVisible',
    'isFeatured',
    'displayOrder',
    'createdAt',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.seo.update({ title: 'Manage Reviews - Admin', description: 'Manage customer testimonials' });
    this.loadReviews();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (review, filter) => {
      const q = filter.trim().toLowerCase();
      return (
        review.customerName.toLowerCase().includes(q) ||
        review.reviewText.toLowerCase().includes(q) ||
        (review.customerRole || '').toLowerCase().includes(q) ||
        (review.customerCompany || '').toLowerCase().includes(q)
      );
    };
  }

  loadReviews(): void {
    this.loading.set(true);
    this.reviewService.getAllAdmin().subscribe({
      next: reviews => {
        this.dataSource.data = reviews;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load reviews', 'Close', { duration: 4000 });
      },
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  toggleVisible(review: Review, isVisible: boolean): void {
    this.reviewService.toggleVisibility(review.id, isVisible).subscribe({
      next: updated => {
        this.patchRow(updated);
        this.snackBar.open(`Review ${updated.isVisible ? 'visible' : 'hidden'} on website`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update visibility', 'Close', { duration: 4000 }),
    });
  }

  toggleFeatured(review: Review, isFeatured: boolean): void {
    this.reviewService.toggleFeatured(review.id, isFeatured).subscribe({
      next: updated => {
        this.patchRow(updated);
        this.snackBar.open(`Review ${updated.isFeatured ? 'featured' : 'unfeatured'}`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update featured status', 'Close', { duration: 4000 }),
    });
  }

  deleteReview(review: Review): void {
    const ref = this.dialog.open(DeleteReviewDialog, {
      width: '420px',
      data: { customerName: review.customerName },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.reviewService.delete(review.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(r => r.id !== review.id);
          this.snackBar.open('Review deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete review', 'Close', { duration: 4000 }),
      });
    });
  }

  private patchRow(updated: Review): void {
    this.dataSource.data = this.dataSource.data.map(r => (r.id === updated.id ? updated : r));
  }
}
