import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Language = 'bg' | 'en' | 'es' | 'de';

export interface Translations {
  familyName: string;
  familyOwnedSince: string;
  familyIntro: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);

  public readonly currentLanguage = signal<Language>('en');
  private readonly translationsData = signal<Translations>({
    familyName: 'Ladwine Family Winery',
    familyOwnedSince: 'Family Owned Since 1988',
    familyIntro: 'Three generations caring for our vines, crafting small-batch wines, and welcoming guests to our valley home.'
  });

  public readonly translations = computed(() => this.translationsData());

  constructor() {
    // Watch for language changes and load translations
    effect(() => {
      const lang = this.currentLanguage();
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
    return this.translations()[key];
  }
}


