import type { Photo } from './photo';

export interface GalleryStats {
  totalPhotos: number;
  totalMembers: number;
  recentPhotos: Photo[];
}
