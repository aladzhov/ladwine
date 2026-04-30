import { Component, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export interface MyPosPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
}

export interface MyPosSessionResponse {
  paymentUrl: string;
  sessionId: string;
}

@Component({
  selector: 'app-mypos-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mypos-payment.component.html',
  styleUrl: './mypos-payment.component.css'
})
export class MyPosPaymentComponent {
  private readonly http = inject(HttpClient);

  public readonly amount = input.required<number>();
  public readonly currency = input<string>('EUR');
  public readonly customerEmail = input<string>('');
  public readonly customerName = input<string>('');

  public readonly isProcessing = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly paymentInitiated = output<void>();
  public readonly paymentError = output<string>();

  public initiatePayment(): void {
    this.isProcessing.set(true);
    this.error.set(null);

    const orderId = `LW-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const payload: MyPosPaymentRequest = {
      amount: this.amount(),
      currency: this.currency(),
      orderId,
      customerEmail: this.customerEmail(),
      customerName: this.customerName(),
    };

    this.http
      .post<MyPosSessionResponse>('/.netlify/functions/mypos-checkout', payload)
      .subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          this.paymentInitiated.emit();
          // Redirect user to MyPOS hosted checkout page
          window.location.href = response.paymentUrl;
        },
        error: (err) => {
          this.isProcessing.set(false);
          const message = err?.error?.message || 'Payment initialization failed. Please try again.';
          this.error.set(message);
          this.paymentError.emit(message);
        }
      });
  }
}

