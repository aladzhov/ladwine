import { Component } from '@angular/core';

@Component({
  selector: 'app-qr',
  template: `
    <main class="qr">
      <!-- Plain img: keep the original PNG, lossy CDN conversion could hurt scannability. -->
      <img src="/images/qr-code.png" width="2257" height="2257" alt="QR code for Ladwine contacts" fetchpriority="high" />
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
