import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly router = inject(Router);

  private static readonly UNLOCK_CLICK_COUNT = 5;
  private static readonly UNLOCK_WINDOW_MS = 2000;

  public readonly isUnderConstruction = signal<boolean>(environment.production);

  private clickTimestamps: number[] = [];

  ngOnInit() {
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

  public registerConstructionClick(): void {
    const now = Date.now();
    this.clickTimestamps.push(now);
    this.clickTimestamps = this.clickTimestamps.filter(
      (timestamp) => now - timestamp < App.UNLOCK_WINDOW_MS
    );

    if (this.clickTimestamps.length >= App.UNLOCK_CLICK_COUNT) {
      this.clickTimestamps = [];
      this.isUnderConstruction.set(false);
    }
  }
}
