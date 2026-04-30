import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'winery', pathMatch: 'full' },
  { path: 'winery', data: { tab: 'winery' }, children: [] },
  { path: 'history', data: { tab: 'family' }, children: [] },
  { path: 'vineyards', data: { tab: 'vineyards' }, children: [] },
  { path: 'wines', data: { tab: 'wines' }, children: [] },
  { path: 'wines/:slug', data: { tab: 'wines' }, children: [] },
  { path: 'checkout', data: { tab: 'checkout' }, children: [] },
  { path: '**', redirectTo: 'winery' },
];
