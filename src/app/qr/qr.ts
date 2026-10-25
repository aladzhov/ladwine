import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-qr',
  imports: [NgOptimizedImage],
  template: `
    <main class="qr">
      <img ngSrc="/images/qr-code.png" width="2257" height="2257" alt="QR code for Ladwine contacts" priority />
    </main>
  `,
  styles: `
    .qr {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100dvh;
      padding: 1rem;
      box-sizing: border-box;
      background: var(--color-cream);
    }

    img {
      width: min(90vw, 90dvh);
      height: auto;
    }
  `,
})
export class Qr {}
