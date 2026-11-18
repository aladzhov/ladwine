/** Slide images used by the content pages, shared with the background image preloader. */
export interface SlideImage {
  image: string;
  /** Intrinsic image size in px (required by NgOptimizedImage, prevents layout shift). */
  width: number;
  height: number;
}

/** `sizes` used for slide images; the preloader must use the same value to hit the same srcset candidate. */
export const SLIDE_IMAGE_SIZES = '(max-width: 768px) 100vw, 50vw';

export const WINERY_IMAGE: SlideImage = { image: '/images/history/2-key.jpg', width: 1200, height: 1600 };
export const FAMILY_IMAGE: SlideImage = { image: '/images/history/cheers.jpg', width: 1600, height: 1200 };
export const VINEYARDS_IMAGE: SlideImage = { image: '/images/winery/vineyard-2.jpg', width: 1280, height: 960 };

export const SLIDE_IMAGES: readonly SlideImage[] = [FAMILY_IMAGE, WINERY_IMAGE, VINEYARDS_IMAGE];
