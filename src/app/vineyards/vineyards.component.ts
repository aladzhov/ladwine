import { Component, computed, inject } from '@angular/core';
import { ContentSlider, ContentSlide } from '../content-slider/content-slider';
import { TranslationService } from '../translation.service';
import { VINEYARDS_IMAGE } from '../slide-images';

@Component({
  selector: 'app-vineyards',
  imports: [ContentSlider],
  templateUrl: './vineyards.component.html',
  styleUrl: './vineyards.component.css',
})
export class VineyardsComponent {
  private readonly i18n = inject(TranslationService);

  protected readonly slides = computed<readonly ContentSlide[]>(() => [
    {
      ...VINEYARDS_IMAGE,
      text: this.i18n.translate('vineyardText1'),
    },
  ]);
}
