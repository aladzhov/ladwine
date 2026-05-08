import {CurrencyPipe, NgClass} from '@angular/common';
import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Wine, PackagingType } from './wine.model';
import { EcontDeliveryComponent } from './econt-delivery.component';
import { SpeedyDeliveryComponent } from './speedy-delivery.component';
import { MyPosPaymentComponent } from './mypos-payment.component';
import { RevolutPaymentComponent } from './revolut-payment.component';

type DeliveryMethod = 'personal' | 'econt' | 'speedy';
type PaymentMethod = 'card-on-delivery' | 'card-online-mypos' | 'card-online-revolut';

type RecaptchaV3Api = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

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
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  recaptchaToken?: string;
}

interface QuantityChange {
  name: string;
  packaging: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, EcontDeliveryComponent, SpeedyDeliveryComponent, MyPosPaymentComponent, RevolutPaymentComponent, NgClass],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  public readonly basket = input.required<ReadonlyArray<Wine>>();
  public readonly total = input.required<number>();

  public readonly showDeliveryForm = signal(false);
  public readonly deliveryMethod = signal<DeliveryMethod>('personal');
  public readonly paymentMethod = signal<PaymentMethod>('card-on-delivery');
  public readonly submitOrder = output<CheckoutOrder>();
  public readonly increaseQty = output<QuantityChange>();
  public readonly decreaseQty = output<QuantityChange>();
  public readonly checkoutError = output<string>();

  public readonly econtDelivery = viewChild(EcontDeliveryComponent);
  public readonly speedyDelivery = viewChild(SpeedyDeliveryComponent);

  public name = 'Атанас Ладжов';
  public email = 'ladjo@gbg.bg';
  public phone = '123';
  public address = 'София';

  public readonly isSubmitting = signal(false);

  private static readonly RECAPTCHA_SITE_KEY = '6LfTg94sAAAAALGoUz-2_XfP0_SFJsXtUikZ4w_r';
  private static readonly RECAPTCHA_ACTION = 'checkout_submit';

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

  public onSpeedyOfficeSelected(event: { fullAddress: string }): void {
    this.address = event.fullAddress;
  }

  public setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  public validateForm(): void {
    this.isDeliveryFormValid();
  }

  public async submitDelivery(form: NgForm): Promise<void> {
    if (form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const econtComponent = this.econtDelivery();
    const speedyComponent = this.speedyDelivery();
    let deliveryAddress = this.address;

    if (this.deliveryMethod() === 'econt') {
      deliveryAddress = econtComponent?.getSelectedOfficeAddress() ?? '';
      if (!deliveryAddress) {
        this.checkoutError.emit('Please select an Econt office');
        this.isSubmitting.set(false);
        return;
      }
    } else if (this.deliveryMethod() === 'speedy') {
      deliveryAddress = speedyComponent?.getSelectedOfficeAddress() ?? '';
      if (!deliveryAddress) {
        this.checkoutError.emit('Please select a Speedy office');
        this.isSubmitting.set(false);
        return;
      }
    }

    // Execute reCAPTCHA v3 invisibly
    let recaptchaToken: string;
    try {
      recaptchaToken = await this.executeRecaptcha();
    } catch (error) {
      this.checkoutError.emit('reCAPTCHA verification could not be completed. Please refresh the page and try again.');
      this.isSubmitting.set(false);
      return;
    }

    this.submitOrder.emit({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      deliveryAddress: deliveryAddress || this.address,
      paymentMethod: this.paymentMethod(),
      recaptchaToken
    });
    this.showDeliveryForm.set(false);
    this.isSubmitting.set(false);
    form.resetForm();
  }

  private executeRecaptcha(): Promise<string> {
    const recaptcha = this.getRecaptcha();
    if (!recaptcha?.ready || !recaptcha.execute) {
      return Promise.reject(new Error('Google reCAPTCHA v3 script is not loaded'));
    }

    return new Promise((resolve, reject) => {
      recaptcha.ready(() => {
        recaptcha
          .execute(CheckoutComponent.RECAPTCHA_SITE_KEY, { action: CheckoutComponent.RECAPTCHA_ACTION })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  private getRecaptcha(): RecaptchaV3Api | undefined {
    return (globalThis as typeof globalThis & { grecaptcha?: RecaptchaV3Api }).grecaptcha;
  }
}
