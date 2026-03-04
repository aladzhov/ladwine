import { Component, output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public readonly familyName = 'Ladwine Family Winery';
  public readonly headerClick = output<void>();

  public onHeaderClick(): void {
    this.headerClick.emit();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.headerClick.emit();
    }
  }
}

