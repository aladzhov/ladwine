import {CurrencyPipe, NgClass} from '@angular/common';
import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Wine, PackagingType } from './wine.model';
import { EcontDeliveryComponent } from './econt-delivery.component';

type DeliveryMethod = 'personal' | 'econt';

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
  deliveryAddress?: string; // Can be Econt office or personal address
}

interface QuantityChange {
  name: string;
  packaging: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, EcontDeliveryComponent, NgClass],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  public readonly basket = input.required<ReadonlyArray<Wine>>();
  public readonly total = input.required<number>();

  public readonly showDeliveryForm = signal(false);
  public readonly deliveryMethod = signal<DeliveryMethod>('personal');
  public readonly submitOrder = output<CheckoutOrder>();
  public readonly increaseQty = output<QuantityChange>();
  public readonly decreaseQty = output<QuantityChange>();

  public readonly econtDelivery = viewChild(EcontDeliveryComponent);

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

  public readonly freeDeliveryMessage = computed(() => {
    const total = this.total();
    const freeDeliveryThreshold = 200;

    if (total >= freeDeliveryThreshold) {
      return 'Free delivery! 🎉';
    }

    const remaining = freeDeliveryThreshold - total;
    return `€${remaining.toFixed(2)} until free delivery`;
  });

  public readonly deliveryFee = computed(() => {
    const freeDeliveryThreshold = 200;
    return this.basket().length > 0 && this.total() < freeDeliveryThreshold ? 10 : 0;
  });

  public readonly finalTotal = computed(() => {
    return this.total() + this.deliveryFee();
  });

  public isDeliveryFormValid(): boolean {
    return this.name.trim().length > 0
      && this.email.trim().length > 0
      && this.phone.trim().length > 0
      && this.address.trim().length > 0;
  }

  public proceedToDelivery(): void {
    this.showDeliveryForm.set(true);
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

  public setDeliveryMethod(method: DeliveryMethod): void {
    if (this.deliveryMethod() !== method) {
      this.address = '';
      this.deliveryMethod.set(method);
      this.validateForm();
    }
  }

  public onEcontOfficeSelected(event: { fullAddress: string }): void {
    this.address = event.fullAddress;
  }

  public validateForm(): void {
    // Trigger computed signal evaluation
    this.isDeliveryFormValid();
  }

  public submitDelivery(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    const econtComponent = this.econtDelivery();
    const deliveryAddress = this.deliveryMethod() === 'econt'
      ? econtComponent?.getSelectedOfficeAddress() ?? ''
      : this.address;

    if (this.deliveryMethod() === 'econt' && !deliveryAddress) {
      alert('Please select an Econt office');
      return;
    }

    this.submitOrder.emit({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      deliveryAddress: deliveryAddress || this.address
    });
    this.showDeliveryForm.set(false);
    form.resetForm();
  }
}
