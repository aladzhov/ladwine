import { Component, computed, inject } from '@angular/core';
import { ContentSlider, ContentSlide } from '../content-slider/content-slider';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-the-winery',
  imports: [ContentSlider],
  templateUrl: './the-winery.component.html',
  styleUrl: './the-winery.component.css',
})
export class TheWineryComponent {
  private readonly i18n = inject(TranslationService);

  protected readonly slides = computed<readonly ContentSlide[]>(() => [
    {
      image: '/images/history/2-key.jpg',
      width: 1200,
      height: 1600,
      reverse: true,
      text: this.i18n.translate('wineryText1'),
    },
  ]);
}
