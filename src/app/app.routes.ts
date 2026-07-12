import { Routes } from '@angular/router';
import { InvoiceScanner } from './invoice-scanner/invoice-scanner';
import { AppMain } from './app-main/app-main';

export const routes: Routes = [
  { path: 'invoice-scanner', component: InvoiceScanner },
  {
    path: '',
    component: AppMain,
    children: [
      { path: '', redirectTo: 'winery', pathMatch: 'full' },
      { path: 'winery', data: { tab: 'winery' }, children: [] },
      { path: 'history', data: { tab: 'family' }, children: [] },
      { path: 'vineyards', data: { tab: 'vineyards' }, children: [] },
      { path: 'wines', data: { tab: 'wines' }, children: [] },
      { path: 'wines/:slug', data: { tab: 'wines' }, children: [] },
      { path: 'checkout', data: { tab: 'checkout' }, children: [] },
      { path: 'terms', data: { tab: 'terms' }, children: [] },
      { path: 'privacy', data: { tab: 'privacy' }, children: [] },
      { path: 'delivery-info', data: { tab: 'delivery-info' }, children: [] },
    ]
  },
  { path: '**', redirectTo: '' },
];
