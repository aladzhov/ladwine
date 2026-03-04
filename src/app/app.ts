import {HttpClient} from '@angular/common/http';
import {Component, computed, inject, signal} from '@angular/core';
import {BrowseProducedWinesComponent} from './browse-produced-wines.component';
import {OurFamilyComponent} from './our-family.component';
import {TheWineryComponent} from './the-winery.component';
import {WineDetailsComponent} from './wine-details.component';
import {CheckoutComponent, type CheckoutOrder} from './checkout.component';
import {Wine, WineType} from './wine.model';

type TabKey = 'family' | 'winery' | 'wines';

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [
    OurFamilyComponent,
    TheWineryComponent,
    BrowseProducedWinesComponent,
    WineDetailsComponent,
    CheckoutComponent
  ],
  templateUrl: './app.html',
  styleUrl: './winery.css'
})
export class App {
  private readonly http = inject(HttpClient);

  public readonly familyName = 'Ladwine Family Winery';

  public readonly wineTypes: ReadonlyArray<WineType> = ['Red', 'White', 'Rose', 'Sparkling'];

  public readonly wines = signal<ReadonlyArray<Wine>>([
    {
      name: 'Old Oak Cabernet',
      type: 'Red',
      year: 2022,
      notes: 'Dark cherry, cedar, and gentle spice with soft tannins.',
      pairWith: 'Roasted lamb',
      price: 24.9,
      imageSrc: '/images/wines/old-oak-cabernet.png'
    },
    {
      name: 'Sunny Hill Chardonnay',
      type: 'White',
      year: 2024,
      notes: 'Crisp citrus, pear, and a light touch of vanilla.',
      pairWith: 'Sea bass or creamy pasta',
      price: 19.5,
      imageSrc: '/images/wines/sunny-hill-chardonnay.png'
    },
    {
      name: 'Garden Rose',
      type: 'Rose',
      year: 2025,
      notes: 'Fresh strawberry and watermelon with floral finish.',
      pairWith: 'Summer salads',
      price: 17.9,
      imageSrc: '/images/wines/garden-rose.png'
    },
    {
      name: 'Morning Mist Brut',
      type: 'Sparkling',
      year: 2023,
      notes: 'Fine bubbles with green apple and toasted brioche.',
      pairWith: 'Celebration appetizers',
      price: 28.4,
      imageSrc: '/images/wines/morning-mist-brut.png'
    },
    {
      name: 'Estate Merlot',
      type: 'Red',
      year: 2021,
      notes: 'Plum and cocoa aromas with velvety texture.',
      pairWith: 'Mushroom risotto',
      price: 22.3,
      imageSrc: '/images/wines/estate-merlot.png'
    }
  ]);

  public readonly tabs: ReadonlyArray<Tab> = [
    { key: 'family', label: 'Our Family' },
    { key: 'winery', label: 'The Winery' },
    { key: 'wines', label: 'Browse Produced Wines' }
  ];

  public readonly activeTab = signal<TabKey>('family');
  public readonly selectedType = signal<WineType | 'All'>('All');
  public readonly searchText = signal('');
  public readonly isAgeConfirmed = signal<boolean | null>(null);
  public readonly selectedWine = signal<Wine | null>(null);
  public readonly basket = signal<ReadonlyArray<Wine>>([]);
  public readonly showCheckout = signal(false);
  public readonly showOrderThanks = signal(false);
  public readonly lastOrder = signal<CheckoutOrder | null>(null);
  public readonly checkoutPulse = signal(false);

  public readonly basketTotal = computed(() => {
    return this.basket().reduce((sum, wine) => sum + wine.price, 0);
  });

  public readonly filteredWines = computed(() => {
    const selected = this.selectedType();
    const search = this.searchText().trim().toLowerCase();

    return this.wines().filter((wine) => {
      const matchesType = selected === 'All' || wine.type === selected;
      const matchesSearch = !search || wine.name.toLowerCase().includes(search) || wine.notes.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  });

  public confirmAdult(): void {
    this.isAgeConfirmed.set(true);
  }

  public denyMinor(): void {
    this.isAgeConfirmed.set(false);
  }

  public openWineDetails(wine: Wine): void {
    this.selectedWine.set(wine);
    this.activeTab.set('wines');
    this.showCheckout.set(false);
  }

  public closeWineDetails(): void {
    this.selectedWine.set(null);
  }

  public addToBasket(wine: Wine): void {
    const bottleWine: Wine = { ...wine, packaging: 'bottle'}
    this.basket.update((basket) => [...basket, bottleWine]);
    this.pulseCheckout();
  }

  public addSixPack(wine: Wine): void {
    const bottleWine: Wine = { ...wine, packaging: 'bottle'}
    this.basket.update((basket) => [...basket, bottleWine, bottleWine, bottleWine, bottleWine, bottleWine, bottleWine]);
    this.pulseCheckout();
  }

  public addBagInBox(wine: Wine): void {
    const bagInBoxWine: Wine = { ...wine, packaging: 'bag-in-box' };
    this.basket.update((basket) => [...basket, bagInBoxWine]);
    this.pulseCheckout();
  }

  private pulseCheckout(): void {
    this.checkoutPulse.set(true);
    window.setTimeout(() => this.checkoutPulse.set(false), 320);
  }

  public openCheckout(): void {
    this.showCheckout.set(true);
  }

  public closeCheckout(): void {
    this.showCheckout.set(false);
  }

  public handleOrderSubmit(order: CheckoutOrder): void {
    this.basket.set([]);
    this.lastOrder.set(order);
    this.showOrderThanks.set(true);
  }

  public closeOrderThanks(): void {
    const order = this.lastOrder();

    if (order) {
      this.http
        .post('/.netlify/functions/purchase', {
          purchaseName: order.name,
          purchaseEmail: order.email
        })
        .subscribe({
          error: () => {
            // Keep UX flow unchanged even if email delivery fails.
          }
        });
    }

    this.lastOrder.set(null);
    this.showOrderThanks.set(false);
    this.showCheckout.set(false);
    this.selectedWine.set(null);
    this.activeTab.set('winery');
  }

  public setActiveTab(tab: TabKey): void {
    this.showCheckout.set(false);
    this.activeTab.set(tab);
  }

  public setTypeFilter(type: WineType | 'All'): void {
    this.selectedType.set(type);
  }

  public setSearchText(value: string): void {
    this.searchText.set(value);
  }
}
