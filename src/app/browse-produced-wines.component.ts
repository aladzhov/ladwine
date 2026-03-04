import { Component, input, output } from '@angular/core';

import { Wine } from './wine.model';

@Component({
  selector: 'app-browse-produced-wines',
  standalone: true,
  templateUrl: './browse-produced-wines.component.html',
  styleUrl: './browse-produced-wines.component.css'
})
export class BrowseProducedWinesComponent {
  public readonly wines = input.required<ReadonlyArray<Wine>>();
  public readonly wineSelected = output<Wine>();
}
