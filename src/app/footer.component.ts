import { Component, output, signal } from '@angular/core';
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
  public readonly legalNavigate = output<'terms' | 'privacy' | 'delivery-info'>();

  public readonly socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/groups/1302380510154263', icon: '/images/social/facebook.png' },
    { name: 'Instagram', url: 'https://instagram.com', icon: '/images/social/instagram.png' },
    { name: 'Youtube', url: 'https://www.youtube.com/channel/UCWLTYjI-ajCRvCHc1ach4qQ', icon: '/images/social/youtube.png' },
    { name: 'TikTok', url: 'https://tiktok.com', icon: '/images/social/tiktok.png' },
    { name: 'Discord', url: 'https://discord.gg/5R43pmZ5', icon: '/images/social/discord.png' }
  ];

  public subscribe(): void {
    if (this.email) {
      this.subscriptionMessage.set('Thank you for subscribing!');
      this.email = '';

      setTimeout(() => {
        this.subscriptionMessage.set(null);
      }, 3000);
    }
  }

  public goToLegal(page: 'terms' | 'privacy' | 'delivery-info'): void {
    this.legalNavigate.emit(page);
  }
}

