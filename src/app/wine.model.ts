export type WineType = 'Red' | 'White' | 'Rose' | 'Sparkling';
export type PackagingType = 'bottle' | 'bag-in-box';

export interface Wine {
  name: string;
  type: WineType;
  year: number;
  notes: string;
  pairWith: string;
  price: number;
  imageSrc: string;
  packaging?: PackagingType;
}
