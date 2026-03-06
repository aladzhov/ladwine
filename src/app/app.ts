import {HttpClient} from '@angular/common/http';
import {Component, computed, inject, signal} from '@angular/core';
import {BrowseProducedWinesComponent} from './browse-produced-wines.component';
import {OurFamilyComponent} from './our-family.component';
import {TheWineryComponent} from './the-winery.component';
import {VineyardsComponent} from './vineyards.component';
import {WineDetailsComponent} from './wine-details.component';
import {CheckoutComponent, type CheckoutOrder} from './checkout.component';
import {HeaderComponent} from './header.component';
import {FooterComponent} from './footer.component';
import {Wine} from './wine.model';

type TabKey = 'family' | 'winery' | 'vineyards' | 'wines';

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    OurFamilyComponent,
    TheWineryComponent,
    VineyardsComponent,
    BrowseProducedWinesComponent,
    WineDetailsComponent,
    CheckoutComponent
  ],
  templateUrl: './app.html',
  styleUrl: './winery.css'
})
export class App {
  private readonly http = inject(HttpClient);

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
    { key: 'winery', label: 'Winery' },
    { key: 'vineyards', label: 'Vineyards' },
    { key: 'family', label: 'History' },
    { key: 'wines', label: 'Wines' }
  ];

  public readonly activeTab = signal<TabKey>('winery');
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
    this.selectedWine.set(null);
    this.showCheckout.set(true);
  }

  public handleOrderSubmit(order: CheckoutOrder): void {
    if (order) {
      const payload = {
        purchaseName: order.name,
        purchaseEmail: order.email,
        basket: this.basket()
      };

      this.http
        .post('/.netlify/functions/purchase-customer-mail', payload)
        .subscribe({
          error: () => {
            // Keep UX flow unchanged even if email delivery fails.
          }
        });

      this.http
        .post('/.netlify/functions/purchase-discord', payload)
        .subscribe({
          error: () => {
            // Keep UX flow unchanged even if Discord delivery fails.
          }
        });

      this.http
        .post('/.netlify/functions/purchase-google', payload)
        .subscribe({
          error: () => {
            // Keep UX flow unchanged even if Google Sheets delivery fails.
          }
        });
    }

    this.basket.set([]);
    this.lastOrder.set(order);
    this.showOrderThanks.set(true);
  }

  public increaseItemQuantity(name: string, packaging: string): void {
    const wine = this.basket().find(w => w.name === name && (w.packaging || 'bottle') === packaging);
    if (wine) {
      this.basket.update(basket => [...basket, wine]);
    }
  }

  public decreaseItemQuantity(name: string, packaging: string): void {
    const index = this.basket().findIndex(w => w.name === name && (w.packaging || 'bottle') === packaging);
    if (index !== -1) {
      this.basket.update(basket => basket.filter((_, i) => i !== index));
    }
  }

  public closeOrderThanks(): void {
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
}
