import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslationService, Language, Translations } from '../translation.service';

export type HeaderTabKey = 'home' | 'family' | 'winery' | 'vineyards' | 'wines';
export interface HeaderTab {
  key: HeaderTabKey;
  label: string;
}

const TAB_LABEL_KEYS: Record<HeaderTabKey, keyof Translations> = {
  home: 'menuHome',
  family: 'menuHistory',
  winery: 'menuWinery',
  vineyards: 'menuVineyards',
  wines: 'menuWines',
};

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly translationService = inject(TranslationService);

  public readonly tabs = input.required<ReadonlyArray<HeaderTab>>();
  public readonly activeTab = input.required<HeaderTabKey>();

  public readonly tabSelect = output<HeaderTabKey>();
  public readonly languageChange = output<Language>();

  public readonly showMenuDropdown = signal(false);
  public readonly showLanguageDropdown = signal(false);

  public readonly languages: ReadonlyArray<{ code: Language; label: string }> = [
    { code: 'bg', label: 'БГ' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'de', label: 'DE' },
  ];

  public readonly selectedLanguage = computed(() => this.translationService.currentLanguage());
  public readonly translations = computed(() => this.translationService.translations());
  public readonly familyName = computed(() => this.translations().familyName);

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

  public tabLabel(tab: HeaderTab): string {
    return this.translations()[TAB_LABEL_KEYS[tab.key]] || tab.label;
  }

  public getActiveTabLabel(): string {
    const tab = this.tabs().find((t) => t.key === this.activeTab());
    return tab ? this.tabLabel(tab) : 'Menu';
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
    return this.languages.find((lang) => lang.code === code)?.label || 'EN';
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
