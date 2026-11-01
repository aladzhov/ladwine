import { Component, computed, inject } from '@angular/core';
import { ContentSlider, ContentSlide } from './content-slider/content-slider';
import { TranslationService } from './translation.service';

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
      image: '/images/winery/vineyard-2.jpg',
      alt: 'Vineyard landscape at Ladwine Family Winery',
      text: this.i18n.translate('vineyardText1'),
    },
  ]);
}
