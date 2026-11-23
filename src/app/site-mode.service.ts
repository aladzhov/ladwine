import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../environments/environment';

const PREVIEW_KEY = 'ladwine.previewProduction';
/** Also read by the background preload script in index.html. */
const MONTH_KEY = 'ladwine.previewMonth';

function readMonthOverride(): string | null {
  const stored = localStorage.getItem(MONTH_KEY);
  return stored && /^(0[1-9]|1[0-2])$/.test(stored) ? stored : null;
}

/**
 * Decides whether production-only behaviour applies (e.g. hiding unfinished sections).
 * Production builds are always in production mode; local builds can preview it via the dev mode switch.
 */
@Injectable({ providedIn: 'root' })
export class SiteModeService {
  public readonly canSwitch = !environment.production;

  private readonly productionPreview = signal(this.canSwitch && localStorage.getItem(PREVIEW_KEY) === 'true');

  public readonly isProduction = computed(() => environment.production || this.productionPreview());

  /** Month ('01'-'12') forced via the dev mode switch, or null to use the current month. Always null in production. */
  public readonly monthOverride = signal(this.canSwitch ? readMonthOverride() : null);

  /** Month ('01'-'12') that drives month-dependent content such as the site background. */
  public readonly month = computed(() => this.monthOverride() ?? String(new Date().getMonth() + 1).padStart(2, '0'));

  public setMonthOverride(month: string | null): void {
    if (!this.canSwitch) {
      return;
    }
    this.monthOverride.set(month);
    if (month) {
      localStorage.setItem(MONTH_KEY, month);
    } else {
      localStorage.removeItem(MONTH_KEY);
    }
  }

  public setProductionPreview(enabled: boolean): void {
    if (!this.canSwitch) {
      return;
    }
    this.productionPreview.set(enabled);
    localStorage.setItem(PREVIEW_KEY, String(enabled));
  }
}
