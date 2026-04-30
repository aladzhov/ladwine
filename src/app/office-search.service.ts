import { Injectable } from '@angular/core';
import { Office } from './office.model';

@Injectable({ providedIn: 'root' })
export class OfficeSearchService {

  filterOffices(offices: ReadonlyArray<Office>, term: string): ReadonlyArray<Office> {
    const lowerTerm = term.toLowerCase().trim();
    const lowerTerms = lowerTerm.split(" ");
    if (!lowerTerm) return offices;

    return offices.filter(office => {
        let filtered = true;
        lowerTerms.forEach(lowerTerm => {
          filtered = filtered && (
            // Bulgarian
            office.name.toLowerCase().includes(lowerTerm)
            || office.city.toLowerCase().includes(lowerTerm)
            || office.fullAddress.toLowerCase().includes(lowerTerm)
            // English
            || office.nameEn.toLowerCase().includes(lowerTerm)
            || office.cityEn.toLowerCase().includes(lowerTerm)
            || office.fullAddressEn.toLowerCase().includes(lowerTerm)
          );
        });
        return filtered;
      }
    );
  }

  findClosestOffice(offices: ReadonlyArray<Office>, userLat: number, userLng: number): Office | null {
    let closest: Office | null = null;
    let minDist = Infinity;

    for (const office of offices) {
      if (isNaN(office.latitude) || isNaN(office.longitude)) continue;
      const dist = this.haversineDistance(userLat, userLng, office.latitude, office.longitude);
      if (dist < minDist) {
        minDist = dist;
        closest = office;
      }
    }

    return closest;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

