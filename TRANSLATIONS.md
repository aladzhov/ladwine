# Translation Setup

This project uses a custom translation service for runtime language switching.

## Structure

- **Translation Files**: Located in `src/assets/i18n/`
  - `bg.json` - Bulgarian translations
  - `en.json` - English translations (default)
  - `es.json` - Spanish translations
  - `de.json` - German translations

- **Translation Service**: `src/app/translation.service.ts`
  - Manages current language state
  - Loads translation files dynamically via HTTP
  - Provides reactive translations through Angular signals

## Usage

### In Components

Inject the `TranslationService`:

```typescript
import { TranslationService } from './translation.service';

export class MyComponent {
  private readonly translationService = inject(TranslationService);
  
  public readonly translations = computed(() => this.translationService.translations());
  public readonly myText = computed(() => this.translations().myKey);
}
```

### Adding New Translations

1. Add the key to the `Translations` interface in `translation.service.ts`
2. Add the translated text to all language JSON files
3. Access the translation in your component using computed signals

### Changing Language

```typescript
this.translationService.setLanguage('bg'); // or 'en', 'es', 'de'
```

The language change is reactive and will automatically update all components using translations.

