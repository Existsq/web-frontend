// Data models
export interface Category {
  id: string | number;
  title: string;
  shortDescription: string;
  description?: string;
  basePrice: number;
  imageUUID?: string;
  status?: string;
}
