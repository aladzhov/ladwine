import { Component, input, output } from '@angular/core';

import { Wine } from './wine.model';

@Component({
  selector: 'app-wine-details',
  standalone: true,
  templateUrl: './wine-details.component.html',
  styleUrl: './wine-details.component.css'
})
export class WineDetailsComponent {
  public readonly wine = input.required<Wine>();
  public readonly back = output<void>();
}
