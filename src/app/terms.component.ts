import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PRIMARY_EMAIL, PRIMARY_PHONE } from './contact-info';

@Component({
  selector: 'app-terms',
  standalone: true,
  templateUrl: './terms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './terms.component.css',
})
export class TermsComponent {
  protected readonly email = PRIMARY_EMAIL.address;
  protected readonly phone = PRIMARY_PHONE.number;
}
