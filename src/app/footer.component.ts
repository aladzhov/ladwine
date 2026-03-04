import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  public email = '';
  public readonly subscriptionMessage = signal<string | null>(null);

  public readonly socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
    { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
    { name: 'Youtube', url: 'https://youtube.com', icon: '📺' },
    { name: 'Discord', url: 'https://discord.com', icon: '💬' }
  ];

  public subscribe(): void {
    if (this.email) {
      // TODO: Implement actual subscription logic
      this.subscriptionMessage.set('Thank you for subscribing!');
      this.email = '';

      setTimeout(() => {
        this.subscriptionMessage.set(null);
      }, 3000);
    }
  }
}

