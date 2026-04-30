export interface Office {
  id: number;
  name: string;
  nameEn: string;
  city: string;
  cityEn: string;
  fullAddress: string;
  fullAddressEn: string;
  latitude: number;
  longitude: number;
}

export function sortOffices(offices: Office[]): Office[] {
  return offices.sort((a, b) => {
    const cityCompare = a.city.localeCompare(b.city, 'bg');
    if (cityCompare !== 0) return cityCompare;
    return a.fullAddress.localeCompare(b.fullAddress, 'bg');
  });
}
