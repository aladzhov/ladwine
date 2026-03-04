import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { TranslationService, Language } from './translation.service';

export type HeaderTabKey = 'family' | 'winery' | 'vineyards' | 'wines';
export interface HeaderTab {
  key: HeaderTabKey;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly translationService = inject(TranslationService);

  public readonly tabs = input.required<ReadonlyArray<HeaderTab>>();
  public readonly activeTab = input.required<HeaderTabKey>();

  public readonly headerClick = output<void>();
  public readonly tabSelect = output<HeaderTabKey>();
  public readonly languageChange = output<Language>();

  public readonly showMenuDropdown = signal(false);
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

  public toggleMenuDropdown(event: Event): void {
    event.stopPropagation();
    this.showMenuDropdown.update((show) => !show);
    this.showLanguageDropdown.set(false);
  }

  public selectTab(tab: HeaderTabKey, event: Event): void {
    event.stopPropagation();
    this.tabSelect.emit(tab);
    this.showMenuDropdown.set(false);
  }

  public getActiveTabLabel(): string {
    return this.tabs().find((tab) => tab.key === this.activeTab())?.label ?? 'Menu';
  }

  public toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.showLanguageDropdown.update((show) => !show);
    this.showMenuDropdown.set(false);
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
    if (this.showMenuDropdown()) {
      this.showMenuDropdown.set(false);
    }
    if (this.showLanguageDropdown()) {
      this.showLanguageDropdown.set(false);
    }
  }
}
