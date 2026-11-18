import { provideNetlifyLoader } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // NgOptimizedImage images go through the Netlify Image CDN (resized, WebP/AVIF). Only exists when deployed on Netlify.
    ...(environment.production ? [provideNetlifyLoader()] : []),
  ]
};
