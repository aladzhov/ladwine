import { Component, inject, OnInit, OnDestroy, output, signal, ElementRef, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

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
    location: {
      latitude: string,
      longitude: string
    }
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
export class EcontDeliveryComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);

  public readonly officeSelected = output<{ fullAddress: string }>();

  public readonly offices = signal<ReadonlyArray<EcontOffice>>([]);
  public readonly filteredOffices = signal<ReadonlyArray<EcontOffice>>([]);
  public readonly selectedOfficeId = signal<number | null>(null);
  public readonly searchTerm = signal<string>('');
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public readonly locationStatus = signal<'idle' | 'asking' | 'denied' | 'found'>('idle');

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private markersMap = new Map<number, L.Marker>(); // office.id → marker
  private readonly mapContainerRef = viewChild<ElementRef>('mapContainer');

  // Default marker icon fix for Leaflet + bundlers
  private defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngOnInit(): void {
    this.loadEcontOffices();
  }


  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const container = this.mapContainerRef();
    if (!container) return;

    this.map = L.map(container.nativeElement, {
      zoomControl: true,
    }).setView([42.7, 25.5], 7); // Center of Bulgaria

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    this.markersMap.clear();

    for (const office of this.filteredOffices()) {
      const lat = parseFloat(office.address.location.latitude);
      const lng = parseFloat(office.address.location.longitude);

      if (isNaN(lat) || isNaN(lng)) continue;

      const isSelected = this.selectedOfficeId() === office.id;
      const marker = L.marker([lat, lng], {
        icon: isSelected ? this.selectedIcon : this.defaultIcon,
        title: office.name
      });

      marker.bindPopup(`<strong>${office.name}</strong><br>${office.address.fullAddress}`);
      marker.on('click', () => this.onMarkerClick(office));

      this.markersLayer.addLayer(marker);
      this.markersMap.set(office.id, marker);
    }
  }

  public loadEcontOffices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<EcontApiResponse>('https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json')
      .subscribe({
        next: (response) => {
          const bulgarianOffices = response.offices.filter(
            office => office.address.city.country.code2 === 'BG'
          );
          this.offices.set(bulgarianOffices);
          this.filteredOffices.set(bulgarianOffices);
          this.isLoading.set(false);
          // Wait for DOM to render the map container, then init map + markers
          setTimeout(() => {
            this.initMap();
            this.updateMarkers();
            this.requestUserLocation();
          }, 0);
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
      this.updateMarkers();
      this.panMapToOffice(office);
      this.openMarkerPopup(officeId);
      this.scrollListToOffice(officeId);
    }
  }

  public onMarkerClick(office: EcontOffice): void {
    this.selectedOfficeId.set(office.id);
    this.officeSelected.emit({ fullAddress: office.address.fullAddress });
    this.updateMarkers();
    this.panMapToOffice(office);
    this.openMarkerPopup(office.id);
    this.scrollListToOffice(office.id);
  }

  private panMapToOffice(office: EcontOffice): void {
    if (!this.map) return;
    const lat = parseFloat(office.address.location.latitude);
    const lng = parseFloat(office.address.location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      this.map.setView([lat, lng], 15);
    }
  }

  private openMarkerPopup(officeId: number): void {
    const marker = this.markersMap.get(officeId);
    if (marker) {
      marker.openPopup();
    }
  }

  private scrollListToOffice(officeId: number): void {
    setTimeout(() => {
      const el = document.querySelector(`[data-office-id="${officeId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

  public requestUserLocation(): void {
    if (!navigator.geolocation) {
      this.locationStatus.set('denied');
      return;
    }

    this.locationStatus.set('asking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationStatus.set('found');
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        this.zoomToLocationAndSelectClosest(userLat, userLng);
      },
      () => {
        this.locationStatus.set('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  private zoomToLocationAndSelectClosest(userLat: number, userLng: number): void {
    const closest = this.findClosestOffice(userLat, userLng);
    if (closest) {
      this.selectOffice(closest.id);
    } else if (this.map) {
      this.map.setView([userLat, userLng], 13);
    }
  }

  private findClosestOffice(userLat: number, userLng: number): EcontOffice | null {
    let closest: EcontOffice | null = null;
    let minDist = Infinity;

    for (const office of this.offices()) {
      const lat = parseFloat(office.address.location.latitude);
      const lng = parseFloat(office.address.location.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const dist = this.haversineDistance(userLat, userLng, lat, lng);
      if (dist < minDist) {
        minDist = dist;
        closest = office;
      }
    }

    return closest;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  public onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filterOfficesByTerm(term);
    this.updateMarkers();
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
