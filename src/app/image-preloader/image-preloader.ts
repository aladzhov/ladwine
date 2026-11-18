import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SLIDE_IMAGE_SIZES, SLIDE_IMAGES } from '../slide-images';

/**
 * Renders hidden copies of the slide images so the browser downloads them in the background.
 * Uses the same ngSrc/width/height/sizes as the slider, so the same (CDN-resized) file is
 * picked from the srcset and later served from the cache. Render it inside `@defer (on idle)`.
 */
@Component({
  selector: 'app-image-preloader',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display: none' },
  template: `
    @for (slide of images; track slide.image) {
      <img [ngSrc]="slide.image" [width]="slide.width" [height]="slide.height" [sizes]="sizes" loading="eager" alt="" />
    }
  `,
})
export class ImagePreloader {
  protected readonly images = SLIDE_IMAGES;
  protected readonly sizes = SLIDE_IMAGE_SIZES;
}
