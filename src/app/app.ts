import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DevModeSwitchComponent } from './dev-mode-switch/dev-mode-switch.component';
import { SiteModeService } from './site-mode.service';

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

  ngOnInit() {
    if (this.isPublicPage) {
      return;
    }
    const hostname = window.location.hostname;
    this.router.navigate(['/invoice-scanner']);
    // // Проверяваме дали потребителят е дошъл от поддомейна i.
    if (hostname.startsWith('i.')) {
      this.router.navigate(['/invoice-scanner']);
    } else {
      // Ако е на основния сайт
      this.router.navigate(['']);
    }
  }
}
