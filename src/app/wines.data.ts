import { Wine } from './wine.model';

export const WINES: ReadonlyArray<Wine> = [
  {
    name: 'Old Oak Cabernet',
    slug: 'old-oak-cabernet',
    type: 'Red',
    year: 2022,
    notes: 'Dark cherry, cedar, and gentle spice with soft tannins.',
    pairWith: 'Roasted lamb',
    price: 24.9,
    imageSrc: '/images/wines/old-oak-cabernet.png'
  },
  {
    name: 'Sunny Hill Chardonnay',
    slug: 'sunny-hill-chardonnay',
    type: 'White',
    year: 2024,
    notes: 'Crisp citrus, pear, and a light touch of vanilla.',
    pairWith: 'Sea bass or creamy pasta',
    price: 19.5,
    imageSrc: '/images/wines/sunny-hill-chardonnay.png'
  },
  {
    name: 'Garden Rose',
    slug: 'garden-rose',
    type: 'Rose',
    year: 2025,
    notes: 'Fresh strawberry and watermelon with floral finish.',
    pairWith: 'Summer salads',
    price: 17.9,
    imageSrc: '/images/wines/garden-rose.png'
  },
  {
    name: 'Morning Mist Brut',
    slug: 'morning-mist-brut',
    type: 'Sparkling',
    year: 2023,
    notes: 'Fine bubbles with green apple and toasted brioche.',
    pairWith: 'Celebration appetizers',
    price: 28.4,
    imageSrc: '/images/wines/morning-mist-brut.png'
  },
  {
    name: 'Estate Merlot',
    slug: 'estate-merlot',
    type: 'Red',
    year: 2021,
    notes: 'Plum and cocoa aromas with velvety texture.',
    pairWith: 'Mushroom risotto',
    price: 22.3,
    imageSrc: '/images/wines/estate-merlot.png'
  }
];

