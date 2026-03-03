export type WineType = 'Red' | 'White' | 'Rose' | 'Sparkling';

export interface Wine {
  name: string;
  type: WineType;
  year: number;
  notes: string;
  pairWith: string;
}

