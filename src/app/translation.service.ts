import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

export type Language = 'bg' | 'en' | 'es' | 'de';

export interface Translations {
  familyName: string;
  menuHome?: string;
  homeWelcome?: string;
  menuWinery?: string;
  menuVineyards?: string;
  menuHistory?: string;
  menuWines?: string;
  wineryText1?: string;
  vineyardText1?: string;
  historyText1?: string;
  companyAddress?: string;
  footerSocialLinks?: string;
  footerNewsletterText?: string;
  footerEmailPlaceholder?: string;
  footerSubscribe?: string;
  footerSubscribed?: string;
  footerTerms?: string;
  footerPrivacy?: string;
  footerDelivery?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  public readonly currentLanguage = signal<Language>('bg');
  private readonly translationsData = signal<Translations>({
    familyName: 'Ladzhovs Family Winery',
  });

  /** English texts used for keys missing in the selected language. */
  private readonly fallbackData = signal<Partial<Translations>>({});

  public readonly translations = computed<Translations>(() => ({ ...this.fallbackData(), ...this.translationsData() }));

  constructor() {
    this.http.get<Translations>('/assets/i18n/en.json').subscribe({
      next: (translations) => this.fallbackData.set(translations),
      error: (err) => console.error('Failed to load fallback translations', err),
    });

    // Watch for language changes and load translations
    effect(() => {
      const lang = this.currentLanguage();
      this.document.documentElement.lang = lang;
      this.loadTranslations(lang);
    }, { allowSignalWrites: true });
  }

  private loadTranslations(language: Language): void {
    this.http.get<Translations>(`/assets/i18n/${language}.json`)
      .subscribe({
        next: (translations) => {
          this.translationsData.set(translations);
        },
        error: (err) => {
          console.error(`Failed to load translations for ${language}`, err);
        }
      });
  }

  public setLanguage(language: Language): void {
    this.currentLanguage.set(language);
  }

  public translate(key: keyof Translations): string {
    return this.translations()[key] ?? '';
  }
}


