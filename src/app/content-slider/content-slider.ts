import { Component, computed, input, signal } from '@angular/core';

export interface ContentSlide {
  image: string;
  alt: string;
  text?: string;
  /** Image on the left instead of the right (desktop only). */
  reverse?: boolean;
}

const SWIPE_THRESHOLD_PX = 50;

@Component({
  selector: 'app-content-slider',
  templateUrl: './content-slider.html',
  styleUrl: './content-slider.css',
  host: {
    '(keydown.arrowleft)': 'prev()',
    '(keydown.arrowright)': 'next()',
  },
})
export class ContentSlider {
  public readonly slides = input.required<readonly ContentSlide[]>();
  public readonly label = input('Gallery');

  protected readonly index = signal(0);
  protected readonly hasMany = computed(() => this.slides().length > 1);

  private touchStartX: number | null = null;

  protected paragraphs(text: string): string[] {
    return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }

  protected prev(): void {
    this.goTo(this.index() - 1);
  }

  protected next(): void {
    this.goTo(this.index() + 1);
  }

  protected goTo(i: number): void {
    const count = this.slides().length;
    this.index.set((i + count) % count);
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (dx < 0) this.next();
    else this.prev();
  }
}
