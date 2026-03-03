import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows age confirmation modal on initial load', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.age-modal')?.textContent).toContain('Are you 18 years old or older?');
    expect(compiled.querySelector('h1')).toBeNull();
  });

  it('shows family tab content after confirming age', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.confirmAdult();
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Ladwine Family Winery');
    expect(compiled.querySelector('.panel h2')?.textContent).toContain('Our Family');
  });

  it('switches to winery tab on click', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.confirmAdult();
    fixture.detectChanges();
    await fixture.whenStable();

    const wineryTab = fixture.nativeElement.querySelector('#winery-tab') as HTMLButtonElement;
    wineryTab.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.panel h2')?.textContent).toContain('The Winery');
  });

  it('filters wines by type in wines tab', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.confirmAdult();
    app.setActiveTab('wines');
    app.setTypeFilter('Sparkling');
    fixture.detectChanges();
    await fixture.whenStable();

    const cards = fixture.nativeElement.querySelectorAll('.wine-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Morning Mist Brut');
  });

  it('shows restricted message when user confirms under 18', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    app.denyMinor();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.age-gate')?.textContent).toContain('You must be at least 18 years old');
    expect(compiled.querySelector('h1')).toBeNull();
  });
});
