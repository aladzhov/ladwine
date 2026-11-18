import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DevModeSwitchComponent } from './dev-mode-switch/dev-mode-switch.component';
import { SiteModeService } from './site-mode.service';
import { DOCUMENT } from '@angular/common';
import { injectStructuredData } from './structured-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet, DevModeSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly router = inject(Router);
  protected readonly showDevModeSwitch = inject(SiteModeService).canSwitch;

  private readonly isPublicPage = /^\/(contacts|qr)(\/|$)/.test(window.location.pathname);

  constructor() {
    injectStructuredData(inject(DOCUMENT));
  }

  ngOnInit() {
    if (this.isPublicPage) {
      return;
    }
    // The i. subdomain hosts the invoice scanner; on the main site the router keeps the requested URL.
    if (window.location.hostname.startsWith('i.')) {
      this.router.navigate(['/invoice-scanner']);
    }
  }
}
