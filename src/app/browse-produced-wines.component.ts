import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

import { Wine } from './wine.model';

@Component({
  selector: 'app-browse-produced-wines',
  standalone: true,
  templateUrl: './browse-produced-wines.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './browse-produced-wines.component.css',
})
export class BrowseProducedWinesComponent {
  public readonly wines = input.required<ReadonlyArray<Wine>>();
  public readonly wineSelected = output<Wine>();
  public readonly addToBasket = output<Wine>();
  public readonly addSixPack = output<Wine>();
  public readonly addBagInBox = output<Wine>();
}
