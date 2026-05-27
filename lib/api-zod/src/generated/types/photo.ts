export interface Photo {
  id: number;
  url: string;
  caption: string | null;
  uploaderId: number;
  uploaderName: string;
  createdAt: string;
  isApproved: boolean;
}
