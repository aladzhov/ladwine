import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-delivery-info',
  standalone: true,
  templateUrl: './delivery-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './delivery-info.component.css',
})
export class DeliveryInfoComponent {}
