export type WineType = 'Red' | 'White' | 'Rose' | 'Sparkling';
export type PackagingType = 'bottle' | 'bag-in-box';

export interface Wine {
  name: string;
  slug: string;
  type: WineType;
  year: number;
  notes: string;
  pairWith: string;
  price: number;
  imageSrc: string;
  packaging?: PackagingType;
}

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

