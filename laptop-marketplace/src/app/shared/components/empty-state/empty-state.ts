import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  icon = input('inbox');
  title = input('No items found');
  message = input('Try adjusting your filters or search criteria.');
}
