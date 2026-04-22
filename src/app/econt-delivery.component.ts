import { Component, inject, OnInit, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface EcontOffice {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  address: {
    city: {
      name: string;
      nameEn: string;
      postCode: string;
      country: {
        code2: string
      }
    };
    fullAddress: string;
    fullAddressEn: string;
  };
}

interface EcontApiResponse {
  offices: EcontOffice[];
}

@Component({
  selector: 'app-econt-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './econt-delivery.component.html',
  styleUrl: './econt-delivery.component.css'
})
export class EcontDeliveryComponent implements OnInit {
  private readonly http = inject(HttpClient);

  public readonly officeSelected = output<{ fullAddress: string }>();

  public readonly offices = signal<ReadonlyArray<EcontOffice>>([]);
  public readonly filteredOffices = signal<ReadonlyArray<EcontOffice>>([]);
  public readonly selectedOfficeId = signal<number | null>(null);
  public readonly searchTerm = signal<string>('');
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEcontOffices();
  }

  public loadEcontOffices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<EcontApiResponse>('https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json')
      .subscribe({
        next: (response) => {
          // Filter only Bulgarian offices
          const bulgarianOffices = response.offices.filter(
            office => office.address.city.country.code2 === 'BG'
          );
          this.offices.set(bulgarianOffices);
          this.filteredOffices.set(bulgarianOffices);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading Econt offices:', err);
          this.error.set('Failed to load Econt offices. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  public selectOffice(officeId: number): void {
    this.selectedOfficeId.set(officeId);
    const office = this.getSelectedOffice();
    if (office) {
      this.officeSelected.emit({ fullAddress: office.address.fullAddress });
    }
  }

  public onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filterOfficesByTerm(term);
  }

  private filterOfficesByTerm(term: string): void {
    const lowerTerm = term.toLowerCase().trim();

    if (!lowerTerm) {
      this.filteredOffices.set(this.offices());
      return;
    }

    const filtered = this.offices().filter(office =>
      office.name.toLowerCase().includes(lowerTerm) ||
      office.nameEn.toLowerCase().includes(lowerTerm) ||
      office.address.city.name.toLowerCase().includes(lowerTerm) ||
      office.address.city.nameEn.toLowerCase().includes(lowerTerm)
    );
    this.filteredOffices.set(filtered);
  }

  public getSelectedOffice(): EcontOffice | null {
    const officeId = this.selectedOfficeId();
    if (officeId === null) {
      return null;
    }
    return this.offices().find(office => office.id === officeId) || null;
  }

  public getSelectedOfficeAddress(): string {
    const office = this.getSelectedOffice();
    if (!office) {
      return '';
    }

    return `Econt Office: ${office.name}, ${office.address.fullAddress}`;
  }
}


