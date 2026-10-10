import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-vineyards',
  standalone: true,
  templateUrl: './vineyards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './vineyards.component.css',
})
export class VineyardsComponent {}
