import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../environments/environment';

const PREVIEW_KEY = 'ladwine.previewProduction';

/**
 * Decides whether production-only behaviour applies (e.g. hiding unfinished sections).
 * Production builds are always in production mode; local builds can preview it via the dev mode switch.
 */
@Injectable({ providedIn: 'root' })
export class SiteModeService {
  public readonly canSwitch = !environment.production;

  private readonly productionPreview = signal(this.canSwitch && localStorage.getItem(PREVIEW_KEY) === 'true');

  public readonly isProduction = computed(() => environment.production || this.productionPreview());

  public setProductionPreview(enabled: boolean): void {
    if (!this.canSwitch) {
      return;
    }
    this.productionPreview.set(enabled);
    localStorage.setItem(PREVIEW_KEY, String(enabled));
  }
}
