import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PRIMARY_EMAIL, PRIMARY_PHONE } from './contact-info';

@Component({
  selector: 'app-delivery-info',
  standalone: true,
  templateUrl: './delivery-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './delivery-info.component.css',
})
export class DeliveryInfoComponent {
  protected readonly email = PRIMARY_EMAIL.address;
  protected readonly phone = PRIMARY_PHONE.number;
}
