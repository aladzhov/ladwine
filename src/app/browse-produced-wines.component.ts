import { Component, input, output } from '@angular/core';

import { Wine, WineType } from './wine.model';

@Component({
  selector: 'app-browse-produced-wines',
  standalone: true,
  templateUrl: './browse-produced-wines.component.html',
  styleUrl: './browse-produced-wines.component.css'
})
export class BrowseProducedWinesComponent {
  public readonly wineTypes = input.required<ReadonlyArray<WineType>>();
  public readonly selectedType = input.required<WineType | 'All'>();
  public readonly searchText = input.required<string>();
  public readonly filteredWines = input.required<ReadonlyArray<Wine>>();

  public readonly typeFilterChange = output<WineType | 'All'>();
  public readonly searchTextChange = output<string>();
}
