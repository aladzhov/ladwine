import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let confirmSpy: jasmine.Spy;

  beforeEach(async () => {
    confirmSpy = spyOn(window, 'confirm').and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('shows family tab content by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Ladwine Family Winery');
    expect(compiled.querySelector('.panel h2')?.textContent).toContain('Our Family');
  });

  it('switches to winery tab on click', async () => {
    const fixture = TestBed.createComponent(App);
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
    await fixture.whenStable();

    const app = fixture.componentInstance;
    app.setActiveTab('wines');
    app.setTypeFilter('Sparkling');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.wine-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Morning Mist Brut');
  });

  it('shows restricted message when user is under 18', () => {
    confirmSpy.and.returnValue(false);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.age-gate')?.textContent).toContain('You must be at least 18 years old');
    expect(compiled.querySelector('h1')).toBeNull();
  });
});
