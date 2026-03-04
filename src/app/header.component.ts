import { Component, computed, HostListener, inject, output, signal } from '@angular/core';
import { TranslationService, Language } from './translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly translationService = inject(TranslationService);

  public readonly headerClick = output<void>();
  public readonly languageChange = output<Language>();

  public readonly showLanguageDropdown = signal(false);

  public readonly languages: ReadonlyArray<{ code: Language; label: string }> = [
    { code: 'bg', label: 'БГ' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'de', label: 'DE' }
  ];

  public readonly selectedLanguage = computed(() => this.translationService.currentLanguage());
  public readonly translations = computed(() => this.translationService.translations());
  public readonly familyName = computed(() => this.translations().familyName);
  public readonly familyOwnedSince = computed(() => this.translations().familyOwnedSince);
  public readonly familyIntro = computed(() => this.translations().familyIntro);

  public onHeaderClick(): void {
    this.headerClick.emit();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.headerClick.emit();
    }
  }

  public toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.showLanguageDropdown.update(show => !show);
  }

  public selectLanguage(language: Language, event: Event): void {
    event.stopPropagation();
    this.translationService.setLanguage(language);
    this.languageChange.emit(language);
    this.showLanguageDropdown.set(false);
  }

  public getLanguageLabel(code: Language): string {
    return this.languages.find(lang => lang.code === code)?.label || 'EN';
  }

  @HostListener('document:click')
  public onDocumentClick(): void {
    if (this.showLanguageDropdown()) {
      this.showLanguageDropdown.set(false);
    }
  }
}

