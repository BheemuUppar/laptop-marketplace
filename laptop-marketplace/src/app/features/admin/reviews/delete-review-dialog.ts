import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteReviewDialogData {
  customerName: string;
}

@Component({
  selector: 'app-delete-review-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Review</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this review from <strong>{{ data.customerName }}</strong>?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteReviewDialog {
  readonly dialogRef = inject(MatDialogRef<DeleteReviewDialog>);
  readonly data = inject<DeleteReviewDialogData>(MAT_DIALOG_DATA);
}
