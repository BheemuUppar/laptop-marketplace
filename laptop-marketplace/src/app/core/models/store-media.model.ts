export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  displayOrder: number;
}

export interface GalleryVideo {
  id: string;
  videoId: string;
  title: string;
  displayOrder: number;
}

export interface StoreMediaPublic {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  youtubeChannelUrl: string;
}

export interface StoreMediaItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  imageUrl: string;
  videoId: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  youtubeChannelUrl: string;
}
