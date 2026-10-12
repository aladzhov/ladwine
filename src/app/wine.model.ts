export type PackagingType = 'bottle' | 'bag-in-box';

export interface Wine {
  name: string;
  slug: string;
  type: string;
  year: number;
  notes: string;
  price: number;
  imageSrc: string;
  packaging?: PackagingType;
}
