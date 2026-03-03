import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Wine, WineType } from './wine.model';

interface CheckoutTypeGroup {
  type: WineType;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  public readonly basket = input.required<ReadonlyArray<Wine>>();
  public readonly total = input.required<number>();

  public readonly showDeliveryForm = signal(false);
  public readonly submitOrder = output<void>();

  public firstName = '';
  public lastName = '';
  public email = '';
  public phone = '';
  public city = '';
  public address = '';

  public readonly groupedByType = computed<ReadonlyArray<CheckoutTypeGroup>>(() => {
    const map = new Map<WineType, CheckoutTypeGroup>();

    for (const wine of this.basket()) {
      const existing = map.get(wine.type);
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += wine.price;
      } else {
        map.set(wine.type, {
          type: wine.type,
          quantity: 1,
          subtotal: wine.price
        });
      }
    }

    return Array.from(map.values());
  });

  public proceedToDelivery(): void {
    this.showDeliveryForm.set(true);
  }

  public backToCheckout(): void {
    this.showDeliveryForm.set(false);
  }

  public submitDelivery(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.submitOrder.emit();
    this.showDeliveryForm.set(false);
    form.resetForm();
  }
}
