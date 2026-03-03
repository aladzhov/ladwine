import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('shows age confirmation modal on first load', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.age-modal')).not.toBeNull();
  });

  it('opens wine details and adds wine to checkout basket', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.confirmAdult();
    app.setActiveTab('wines');
    fixture.detectChanges();

    const wineButton = fixture.nativeElement.querySelector('.wine-card-button') as HTMLButtonElement;
    wineButton.click();
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.action-btn-primary') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    const checkoutTitle = fixture.nativeElement.querySelector('.checkout-panel h2') as HTMLElement;
    expect(checkoutTitle.textContent).toContain('Checkout');

    const basketRows = fixture.nativeElement.querySelectorAll('.checkout-item');
    expect(basketRows.length).toBe(1);
  });

  it('shows order thank-you modal and redirects to The Winery on close', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.confirmAdult();
    app.handleOrderSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#order-thanks-title')?.textContent).toContain('Thank you for your order');

    const closeButton = compiled.querySelector('#order-thanks-title')?.parentElement?.querySelector('button') as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect(app.activeTab()).toBe('winery');
    expect(compiled.querySelector('.panel h2')?.textContent).toContain('The Winery');
  });
});
