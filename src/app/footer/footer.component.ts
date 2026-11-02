import { Component, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { EMAILS, PHONES, SOCIAL_LINKS, GOOGLE_MAPS_URL, telHref } from '../contact-info';
import { TranslationService, Translations } from '../translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly i18n = inject(TranslationService);

  public readonly showLegalLinks = !environment.production;
  public email = '';
  public readonly subscriptionMessage = signal<string | null>(null);
  public readonly legalNavigate = output<'terms' | 'privacy' | 'delivery-info'>();

  public readonly phones = PHONES;
  public readonly telHref = telHref;
  public readonly mapsUrl = GOOGLE_MAPS_URL;
  public readonly emails = EMAILS.filter((email) => email.id === 'office');
  public readonly socialLinks = SOCIAL_LINKS;

  public subscribe(): void {
    if (this.email) {
      this.subscriptionMessage.set(this.t('footerSubscribed'));
      this.email = '';

      setTimeout(() => {
        this.subscriptionMessage.set(null);
      }, 3000);
    }
  }

  public t(key: keyof Translations): string {
    return this.i18n.translate(key);
  }

  public goToLegal(page: 'terms' | 'privacy' | 'delivery-info'): void {
    this.legalNavigate.emit(page);
  }
}
