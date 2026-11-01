import { Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage],
  host: { class: 'home' },
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly i18n = inject(TranslationService);
  protected readonly welcome = computed(() => this.i18n.translate('homeWelcome') || 'Welcome!');
}
