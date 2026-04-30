import { Component, inject, OnInit, OnDestroy, output, signal, ElementRef, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Office, sortOffices } from './office.model';
import { OfficeSearchService } from './office-search.service';

// Raw Speedy API types (matches https://api.speedy.bg/api/docs/ sections 3.18 + 3.4.3)
// English address fields are added by our proxy (speedy-offices.ts) which merges BG + EN calls.
interface SpeedyApiOffice {
  id: number;
  name: string;
  nameEn: string;
  address: {
    siteName: string;
    fullAddressString: string;
    siteNameEn: string;
    fullAddressStringEn: string;
    x: number;
    y: number;
  };
}

interface SpeedyApiResponse {
  offices: SpeedyApiOffice[];
}

@Component({
  selector: 'app-speedy-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './speedy-delivery.component.html',
  styleUrl: './speedy-delivery.component.css'
})
export class SpeedyDeliveryComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly searchService = inject(OfficeSearchService);

  public readonly officeSelected = output<{ fullAddress: string }>();

  public readonly offices = signal<ReadonlyArray<Office>>([]);
  public readonly filteredOffices = signal<ReadonlyArray<Office>>([]);
  public readonly selectedOfficeId = signal<number | null>(null);
  public readonly searchTerm = signal<string>('');
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public readonly locationStatus = signal<'idle' | 'asking' | 'denied' | 'found'>('idle');

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private markersMap = new Map<number, L.Marker>();
  private readonly mapContainerRef = viewChild<ElementRef>('mapContainer');

  private defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  private selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  ngOnInit(): void {
    this.loadSpeedyOffices();
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

    this.map = L.map(container.nativeElement, { zoomControl: true }).setView([42.7, 25.5], 7);

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
      if (isNaN(office.latitude) || isNaN(office.longitude)) continue;

      const isSelected = this.selectedOfficeId() === office.id;
      const marker = L.marker([office.latitude, office.longitude], {
        icon: isSelected ? this.selectedIcon : this.defaultIcon,
        title: office.name
      });

      marker.bindPopup(`<strong>${office.name}</strong><br>${office.fullAddress}`);
      marker.on('click', () => this.onMarkerClick(office));

      this.markersLayer.addLayer(marker);
      this.markersMap.set(office.id, marker);
    }
  }

  private mapSpeedyToOffice(raw: SpeedyApiOffice): Office {
    return {
      id: raw.id,
      name: raw.name,
      nameEn: raw.nameEn,
      city: raw.address.siteName,
      cityEn: raw.address.siteNameEn,
      fullAddress: raw.address.fullAddressString,
      fullAddressEn: raw.address.fullAddressStringEn,
      latitude: raw.address.y,
      longitude: raw.address.x,
    };
  }

  public loadSpeedyOffices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<SpeedyApiResponse>('/.netlify/functions/speedy-offices')
      .subscribe({
        next: (response) => {
          const mapped = (response.offices || []).map(o => this.mapSpeedyToOffice(o));
          const sorted = sortOffices(mapped);
          this.offices.set(sorted);
          this.filteredOffices.set(sorted);
          this.isLoading.set(false);
          setTimeout(() => {
            this.initMap();
            this.updateMarkers();
            this.requestUserLocation();
          }, 0);
        },
        error: (err) => {
          console.error('Error loading Speedy offices:', err);
          this.error.set('Failed to load Speedy offices. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  public selectOffice(officeId: number): void {
    this.selectedOfficeId.set(officeId);
    const office = this.getSelectedOffice();
    if (office) {
      this.officeSelected.emit({ fullAddress: office.fullAddress });
      this.updateMarkers();
      this.panMapToOffice(office);
      this.openMarkerPopup(officeId);
      this.scrollListToOffice(officeId);
    }
  }

  public onMarkerClick(office: Office): void {
    this.selectedOfficeId.set(office.id);
    this.officeSelected.emit({ fullAddress: office.fullAddress });
    this.updateMarkers();
    this.panMapToOffice(office);
    this.openMarkerPopup(office.id);
    this.scrollListToOffice(office.id);
  }

  private panMapToOffice(office: Office): void {
    if (!this.map) return;
    if (!isNaN(office.latitude) && !isNaN(office.longitude)) {
      this.map.setView([office.latitude, office.longitude], 15);
    }
  }

  private openMarkerPopup(officeId: number): void {
    const marker = this.markersMap.get(officeId);
    if (marker) marker.openPopup();
  }

  private scrollListToOffice(officeId: number): void {
    setTimeout(() => {
      const el = document.querySelector(`[data-speedy-office-id="${officeId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        this.zoomToLocationAndSelectClosest(position.coords.latitude, position.coords.longitude);
      },
      () => this.locationStatus.set('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  private zoomToLocationAndSelectClosest(userLat: number, userLng: number): void {
    const closest = this.searchService.findClosestOffice(this.offices(), userLat, userLng);
    if (closest) {
      this.selectOffice(closest.id);
    } else if (this.map) {
      this.map.setView([userLat, userLng], 13);
    }
  }

  public onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filteredOffices.set(this.searchService.filterOffices(this.offices(), term));
    this.updateMarkers();
  }


  public getSelectedOffice(): Office | null {
    const officeId = this.selectedOfficeId();
    if (officeId === null) return null;
    return this.offices().find(office => office.id === officeId) || null;
  }

  public getSelectedOfficeAddress(): string {
    const office = this.getSelectedOffice();
    if (!office) return '';
    return `Speedy Office: ${office.name}, ${office.fullAddress}`;
  }
}

