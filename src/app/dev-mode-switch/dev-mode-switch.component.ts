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
