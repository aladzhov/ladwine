import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Wine } from './wine.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  public readonly basket = input.required<ReadonlyArray<Wine>>();
  public readonly total = input.required<number>();

  public readonly removeWine = output<number>();
  public readonly clearBasket = output<void>();
}

