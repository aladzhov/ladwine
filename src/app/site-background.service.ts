import { DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

type BackgroundManifest = Record<string, string[]>;

interface BackgroundLayer {
  image: Signal<string>;
  opacity: Signal<number>;
  zoom: Signal<boolean>;
}

@Injectable({ providedIn: 'root' })
export class SiteBackgroundService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly BASE_PATH = '/images/site-background';
  private static readonly FALLBACK_IMAGE = '/images/site-background.jpg';
  private static readonly MANIFEST_URL = `${SiteBackgroundService.BASE_PATH}/manifest.json`;

  /** Duration of a crossfade, in milliseconds. Must match the CSS transition. */
  private static readonly FADE_MS = 1200;

  private images: ReadonlyArray<string> = [];
  private index = 0;

  // Two stacked layers crossfade into each other so no black frame appears:
  // the incoming image fades in on top while the current one stays visible.
  private readonly layerImage = [
    signal(SiteBackgroundService.FALLBACK_IMAGE),
    signal(SiteBackgroundService.FALLBACK_IMAGE),
  ];
  private readonly layerOpacity = [signal(1), signal(0)];
  private readonly layerZoom = [signal(false), signal(false)];
  private readonly frontLayer = signal(0);

  /** The two background layers, consumed by the template. */
  public readonly layers: ReadonlyArray<BackgroundLayer> = [
    {
      image: this.layerImage[0].asReadonly(),
      opacity: this.layerOpacity[0].asReadonly(),
      zoom: this.layerZoom[0].asReadonly(),
    },
    {
      image: this.layerImage[1].asReadonly(),
      opacity: this.layerOpacity[1].asReadonly(),
      zoom: this.layerZoom[1].asReadonly(),
    },
  ];

  /** Index of the layer currently rendered on top. */
  public readonly front = this.frontLayer.asReadonly();

  private timer: ReturnType<typeof setInterval> | undefined;
  private fadeTimer: ReturnType<typeof setTimeout> | undefined;
  private zoomTimer: ReturnType<typeof setTimeout> | undefined;
  private started = false;

  /** Loads the current month's images and begins rotating through them. */
  public start(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    this.destroyRef.onDestroy(() => this.stopRotation());
    this.restartZoom(this.frontLayer());

    this.http
      .get<BackgroundManifest>(SiteBackgroundService.MANIFEST_URL)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (manifest) => {
          const names = manifest?.[month] ?? [];
          this.images = names.map((name) => `${SiteBackgroundService.BASE_PATH}/${month}/${name}`);
          if (this.images.length > 0) {
            this.index = 0;
            this.layerImage[this.frontLayer()].set(this.images[0]);
            this.restartZoom(this.frontLayer());
            this.preload(this.images);
            this.startRotation();
          }
        },
        error: () => {
          // Manifest missing/unreachable: keep the static fallback image.
        },
      });
  }

  private startRotation(): void {
    this.stopRotation();
    if (this.images.length <= 1) {
      return;
    }
    const period = environment.backgroundRotationMs ?? 10000;
    this.timer = setInterval(() => this.advance(), period);
  }

  /** Crossfades: fade the next image in on top, then reset the layer below. */
  private advance(): void {
    this.index = (this.index + 1) % this.images.length;
    const nextImage = this.images[this.index];

    const outgoing = this.frontLayer();
    const incoming = outgoing === 0 ? 1 : 0;

    this.layerImage[incoming].set(nextImage);
    this.frontLayer.set(incoming);
    this.layerOpacity[incoming].set(1);
    this.restartZoom(incoming);

    this.fadeTimer = setTimeout(() => {
      // Hidden behind the now-opaque incoming layer: reset for the next cycle.
      this.layerOpacity[outgoing].set(0);
      this.layerZoom[outgoing].set(false);
    }, SiteBackgroundService.FADE_MS);
  }

  /**
   * Resets a layer to its unzoomed size, then re-enables the zoom on the next
   * tick so the CSS transform transition (10% over 10s) runs from the start.
   * The transition ends at the zoomed size, so a single image simply stops.
   */
  private restartZoom(layer: number): void {
    if (this.zoomTimer !== undefined) {
      clearTimeout(this.zoomTimer);
    }
    this.layerZoom[layer].set(false);
    this.zoomTimer = setTimeout(() => {
      this.zoomTimer = undefined;
      this.layerZoom[layer].set(true);
    }, 50);
  }

  private stopRotation(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.fadeTimer !== undefined) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = undefined;
    }
    if (this.zoomTimer !== undefined) {
      clearTimeout(this.zoomTimer);
      this.zoomTimer = undefined;
    }
  }

  private preload(urls: ReadonlyArray<string>): void {
    if (typeof Image === 'undefined') {
      return;
    }
    for (const url of urls) {
      const img = new Image();
      img.src = url;
    }
  }
}
