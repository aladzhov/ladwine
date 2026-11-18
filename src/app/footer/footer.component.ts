import { Component, HostListener, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { EMAILS, PHONES, SOCIAL_LINKS, GOOGLE_MAPS_URL, telHref, viberHref } from '../contact-info';
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
  public readonly viberHref = viberHref;
  public readonly mapsUrl = GOOGLE_MAPS_URL;
  public readonly emails = EMAILS.filter((email) => email.id === 'office');
  public readonly socialLinks = SOCIAL_LINKS;

  /** The phone number / e-mail whose options menu is open. */
  public readonly openContactMenu = signal<string | null>(null);
  /** The value just copied to the clipboard, shown briefly as "Copied!". */
  public readonly copiedValue = signal<string | null>(null);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  public toggleContactMenu(value: string, event: Event): void {
    event.stopPropagation();
    this.openContactMenu.update((open) => (open === value ? null : value));
    this.copiedValue.set(null);
  }

  public async copyToClipboard(value: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (!(await this.writeClipboard(value))) {
      return;
    }
    this.copiedValue.set(value);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copiedValue.set(null);
      this.openContactMenu.set(null);
    }, 1500);
  }

  private async writeClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for browsers without the async Clipboard API (e.g. non-secure contexts).
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    }
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  public closeContactMenu(): void {
    this.openContactMenu.set(null);
  }

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
