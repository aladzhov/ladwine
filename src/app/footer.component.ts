import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COMPANY_ADDRESS, COMPANY_NAME, EMAILS, PHONES, SOCIAL_LINKS } from './contact-info';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  public email = '';
  public readonly subscriptionMessage = signal<string | null>(null);
  public readonly legalNavigate = output<'terms' | 'privacy' | 'delivery-info'>();

  public readonly companyName = COMPANY_NAME.en;
  public readonly companyAddress = COMPANY_ADDRESS.en;
  public readonly phones = PHONES;
  public readonly emails = EMAILS.filter((email) => email.id === 'office');
  public readonly socialLinks = SOCIAL_LINKS;

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
