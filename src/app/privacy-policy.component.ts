import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PRIMARY_EMAIL, PRIMARY_PHONE } from './contact-info';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  templateUrl: './privacy-policy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './privacy-policy.component.css',
})
export class PrivacyPolicyComponent {
  protected readonly email = PRIMARY_EMAIL.address;
  protected readonly phone = PRIMARY_PHONE.number;
}
