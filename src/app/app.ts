import { Component, computed, OnInit, signal } from '@angular/core';
import { BrowseProducedWinesComponent } from './browse-produced-wines.component';
import { OurFamilyComponent } from './our-family.component';
import { TheWineryComponent } from './the-winery.component';
import { Wine, WineType } from './wine.model';

type TabKey = 'family' | 'winery' | 'wines';

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [OurFamilyComponent, TheWineryComponent, BrowseProducedWinesComponent],
  templateUrl: './app.html',
  styleUrl: './winery.css'
})
export class App implements OnInit {
  public readonly familyName = 'Ladwine Family Winery';

  public readonly wineTypes: ReadonlyArray<WineType> = ['Red', 'White', 'Rose', 'Sparkling'];

  public readonly wines = signal<ReadonlyArray<Wine>>([
    {
      name: 'Old Oak Cabernet',
      type: 'Red',
      year: 2022,
      notes: 'Dark cherry, cedar, and gentle spice with soft tannins.',
      pairWith: 'Roasted lamb'
    },
    {
      name: 'Sunny Hill Chardonnay',
      type: 'White',
      year: 2024,
      notes: 'Crisp citrus, pear, and a light touch of vanilla.',
      pairWith: 'Sea bass or creamy pasta'
    },
    {
      name: 'Garden Rose',
      type: 'Rose',
      year: 2025,
      notes: 'Fresh strawberry and watermelon with floral finish.',
      pairWith: 'Summer salads'
    },
    {
      name: 'Morning Mist Brut',
      type: 'Sparkling',
      year: 2023,
      notes: 'Fine bubbles with green apple and toasted brioche.',
      pairWith: 'Celebration appetizers'
    },
    {
      name: 'Estate Merlot',
      type: 'Red',
      year: 2021,
      notes: 'Plum and cocoa aromas with velvety texture.',
      pairWith: 'Mushroom risotto'
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
  public readonly isAgeConfirmed = signal(false);

  public ngOnInit(): void {
    const isAdult = window.confirm('Are you 18 years old or older?');
    this.isAgeConfirmed.set(isAdult);
  }

  public readonly filteredWines = computed(() => {
    const selected = this.selectedType();
    const search = this.searchText().trim().toLowerCase();

    return this.wines().filter((wine) => {
      const matchesType = selected === 'All' || wine.type === selected;
      const matchesSearch = !search || wine.name.toLowerCase().includes(search) || wine.notes.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  });

  public setActiveTab(tab: TabKey): void {
    this.activeTab.set(tab);
  }

  public setTypeFilter(type: WineType | 'All'): void {
    this.selectedType.set(type);
  }

  public setSearchText(value: string): void {
    this.searchText.set(value);
  }
}
