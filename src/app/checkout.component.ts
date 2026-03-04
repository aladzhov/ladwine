import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Wine, PackagingType } from './wine.model';

interface CheckoutWineGroup {
  name: string;
  packaging: PackagingType;
  quantity: number;
  subtotal: number;
}

export interface CheckoutOrder {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface QuantityChange {
  name: string;
  packaging: string;
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
  public readonly submitOrder = output<CheckoutOrder>();
  public readonly increaseQty = output<QuantityChange>();
  public readonly decreaseQty = output<QuantityChange>();

  public name = 'Атанас Ладжов';
  public email = 'ladjo@gbg.bg';
  public phone = '123';
  public address = 'София';

  public readonly groupedByType = computed<ReadonlyArray<CheckoutWineGroup>>(() => {
    const map = new Map<string, CheckoutWineGroup>();

    for (const wine of this.basket()) {
      const packaging = wine.packaging || 'bottle';
      const key = `${wine.name}|${packaging}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += 1;
        existing.subtotal += wine.price;
      } else {
        map.set(key, {
          name: wine.name,
          packaging: packaging,
          quantity: 1,
          subtotal: wine.price
        });
      }
    }

    return Array.from(map.values());
  });

  public canProceed(): boolean {
    return this.total() >= 50;
  }

  public proceedToDelivery(): void {
    if (this.canProceed()) {
      this.showDeliveryForm.set(true);
    }
  }

  public backToCheckout(): void {
    this.showDeliveryForm.set(false);
  }

  public onIncreaseQuantity(name: string, packaging: string): void {
    this.increaseQty.emit({ name, packaging });
  }

  public onDecreaseQuantity(name: string, packaging: string): void {
    this.decreaseQty.emit({ name, packaging });
  }

  public submitDelivery(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.submitOrder.emit({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address
    });
    this.showDeliveryForm.set(false);
    form.resetForm();
  }
}
