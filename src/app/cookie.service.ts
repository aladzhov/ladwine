import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  setCookie(name: string, value: string, hoursToExpire: number = 24): void {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursToExpire);
    const expires = `expires=${expirationDate.toUTCString()}`;
    const cookieValue = encodeURIComponent(value);
    document.cookie = `${name}=${cookieValue}; ${expires}; path=/`;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

