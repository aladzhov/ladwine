import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly router = inject(Router);

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
