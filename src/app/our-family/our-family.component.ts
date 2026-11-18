import { Component, computed, inject } from '@angular/core';
import { ContentSlider, ContentSlide } from '../content-slider/content-slider';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-our-family',
  imports: [ContentSlider],
  templateUrl: './our-family.component.html',
  styleUrl: './our-family.component.css',
})
export class OurFamilyComponent {
  private readonly i18n = inject(TranslationService);

  protected readonly slides = computed<readonly ContentSlide[]>(() => [
    {
      image: '/images/history/cheers.jpg',
      width: 1600,
      height: 1200,
      text: this.i18n.translate('historyText1'),
    },
  ]);
}
