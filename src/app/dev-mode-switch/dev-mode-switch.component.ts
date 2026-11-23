import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { SiteModeService } from '../site-mode.service';

/** Local-only menu for previewing production behaviour. Never rendered in production builds. */
@Component({
  selector: 'app-dev-mode-switch',
  standalone: true,
  templateUrl: './dev-mode-switch.component.html',
  styleUrl: './dev-mode-switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevModeSwitchComponent {
  protected readonly siteMode = inject(SiteModeService);
  protected readonly open = signal(false);

  private static readonly MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  protected readonly months = DevModeSwitchComponent.MONTH_NAMES.map((name, i) => {
    const value = String(i + 1).padStart(2, '0');
    return { value, label: `${value} – ${name}` };
  });

  protected readonly currentMonth = DevModeSwitchComponent.MONTH_NAMES[new Date().getMonth()];

  protected selectMonth(event: Event): void {
    this.siteMode.setMonthOverride((event.target as HTMLSelectElement).value || null);
  }

  protected toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((open) => !open);
  }

  protected select(production: boolean, event: Event): void {
    event.stopPropagation();
    this.siteMode.setProductionPreview(production);
    this.open.set(false);
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  protected close(): void {
    this.open.set(false);
  }
}
