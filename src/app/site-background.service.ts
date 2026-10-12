import { DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

type BackgroundManifest = Record<string, string[]>;

interface BackgroundLayer {
  image: Signal<string>;
  opacity: Signal<number>;
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
  private readonly frontLayer = signal(0);

  /** The two background layers, consumed by the template. */
  public readonly layers: ReadonlyArray<BackgroundLayer> = [
    { image: this.layerImage[0].asReadonly(), opacity: this.layerOpacity[0].asReadonly() },
    { image: this.layerImage[1].asReadonly(), opacity: this.layerOpacity[1].asReadonly() },
  ];

  /** Index of the layer currently rendered on top. */
  public readonly front = this.frontLayer.asReadonly();

  private timer: ReturnType<typeof setInterval> | undefined;
  private fadeTimer: ReturnType<typeof setTimeout> | undefined;
  private started = false;

  /** Loads the current month's images and begins rotating through them. */
  public start(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    this.destroyRef.onDestroy(() => this.stopRotation());

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

    this.fadeTimer = setTimeout(() => {
      // Hidden behind the now-opaque incoming layer: reset for the next cycle.
      this.layerOpacity[outgoing].set(0);
    }, SiteBackgroundService.FADE_MS);
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
