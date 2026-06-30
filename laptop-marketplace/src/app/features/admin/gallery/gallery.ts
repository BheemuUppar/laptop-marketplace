import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreMediaService } from '../../../core/services/store-media';
import { SeoService } from '../../../core/services/seo';
import { StoreMediaItem } from '../../../core/models/store-media.model';

@Component({
  selector: 'app-admin-gallery',
  imports: [FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class AdminGallery implements OnInit {
  private readonly storeMedia = inject(StoreMediaService);
  private readonly seo = inject(SeoService);

  readonly items = signal<StoreMediaItem[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly addingVideo = signal(false);
  readonly savingSettings = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly photos = computed(() => this.items().filter(i => i.type === 'photo'));
  readonly videos = computed(() => this.items().filter(i => i.type === 'video'));

  youtubeChannelUrl = '';
  videoUrl = '';
  videoTitle = '';
  videoOrder = 0;

  ngOnInit(): void {
    this.seo.update({ title: 'Store Gallery - Admin', description: 'Manage store photos and videos' });
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.storeMedia.getAllAdmin().subscribe({
      next: items => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load gallery items.');
        this.loading.set(false);
      },
    });

    this.storeMedia.getSettings().subscribe({
      next: settings => {
        this.youtubeChannelUrl = settings.youtubeChannelUrl || '';
      },
    });
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.error.set('');
    this.success.set('');
    this.uploading.set(true);

    const files = Array.from(input.files);
    this.storeMedia.uploadGalleryImages(files).subscribe({
      next: res => {
        const urls = res.urls || [];
        if (!urls.length) {
          this.uploading.set(false);
          this.error.set('Upload failed. Check Cloudinary settings.');
          input.value = '';
          return;
        }

        let pending = urls.length;
        urls.forEach((url, index) => {
          this.storeMedia.addPhoto(url, `Store photo ${this.photos().length + index + 1}`, this.photos().length + index).subscribe({
            next: item => {
              this.items.update(list => [...list, item]);
              pending -= 1;
              if (pending === 0) {
                this.uploading.set(false);
                this.success.set(`${urls.length} photo(s) uploaded to Cloudinary.`);
                input.value = '';
              }
            },
            error: err => {
              pending -= 1;
              this.error.set(err.error?.message || 'Failed to save photo.');
              if (pending === 0) {
                this.uploading.set(false);
                input.value = '';
              }
            },
          });
        });
      },
      error: err => {
        this.uploading.set(false);
        this.error.set(err.error?.message || 'Image upload failed.');
        input.value = '';
      },
    });
  }

  updatePhotoTitle(photo: StoreMediaItem, title: string): void {
    this.storeMedia.updateItem(photo.id, { title }).subscribe({
      next: updated => this.patchItem(updated),
    });
  }

  updatePhotoOrder(photo: StoreMediaItem, event: Event): void {
    const displayOrder = Number((event.target as HTMLInputElement).value) || 0;
    this.storeMedia.updateItem(photo.id, { displayOrder }).subscribe({
      next: updated => this.patchItem(updated),
    });
  }

  addVideo(): void {
    if (!this.videoUrl.trim()) return;

    this.error.set('');
    this.success.set('');
    this.addingVideo.set(true);

    this.storeMedia.addVideo(this.videoUrl.trim(), this.videoTitle.trim(), this.videoOrder).subscribe({
      next: item => {
        this.items.update(list => [...list, item]);
        this.videoUrl = '';
        this.videoTitle = '';
        this.videoOrder = 0;
        this.addingVideo.set(false);
        this.success.set('Video added.');
      },
      error: err => {
        this.addingVideo.set(false);
        this.error.set(err.error?.message || 'Failed to add video.');
      },
    });
  }

  saveSettings(): void {
    this.savingSettings.set(true);
    this.storeMedia.saveSettings(this.youtubeChannelUrl.trim()).subscribe({
      next: settings => {
        this.youtubeChannelUrl = settings.youtubeChannelUrl;
        this.savingSettings.set(false);
        this.success.set('YouTube channel link saved.');
      },
      error: err => {
        this.savingSettings.set(false);
        this.error.set(err.error?.message || 'Failed to save settings.');
      },
    });
  }

  toggleVisible(item: StoreMediaItem): void {
    this.storeMedia.toggleVisibility(item.id, !item.isVisible).subscribe({
      next: updated => this.patchItem(updated),
    });
  }

  deleteItem(item: StoreMediaItem): void {
    const label = item.type === 'photo' ? 'photo' : 'video';
    if (!confirm(`Delete this ${label}?`)) return;

    this.storeMedia.deleteItem(item.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== item.id));
        this.success.set(`${label} deleted.`);
      },
      error: err => this.error.set(err.error?.message || 'Delete failed.'),
    });
  }

  private patchItem(updated: StoreMediaItem): void {
    this.items.update(list => list.map(i => (i.id === updated.id ? updated : i)));
  }
}
