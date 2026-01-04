# Grammy-Pug

A lightweight and flexible i18n (internationalization) plugin for [Grammy](https://grammy.dev) that uses [Pug](https://pugjs.org) templates for localization.  
Render dynamic, locale-specific messages with ease using Pug’s powerful templating syntax.

---

## Features

- **Pug‑based templates** – Use loops, conditionals, variables, and includes directly in your locale files.
- **Automatic locale detection** – Detects user language from `ctx.from.language_code` or session `__lang`.
- **Session‑based language switching** – Store user language preference in session for persistence.
- **File‑based caching** – Templates are compiled and cached for fast repeated use (optional).
- **Lightweight** – Minimal dependencies, fast filesystem-based loading.
- **TypeScript ready** – Includes full type definitions.
- **Recursive template lookup** – Automatically discovers nested template files in locale directories.

## Installation

```bash
npm install grammy-pug
# or
yarn add grammy-pug
```

## Quick Start

1. **Prepare your locale folder structure**:

```
locales/
├── en/
│   ├── welcome.pug
│   └── menu.pug
└── ru/
    ├── welcome.pug
    └── menu.pug
```

2. **Write a Pug template** (example `locales/en/welcome.pug`):

```pug
| Hello, #{name}! Welcome to #{botName}.
| You have #{count} new messages.
```

3. **Set up the plugin in your bot**:

```ts
import { Bot, Context, session } from 'grammy';
import { pug, PugFlavor } from 'grammy-pug';

// Extend your context type
type MyContext = Context & PugFlavor;

const bot = new Bot<MyContext>('BOT_TOKEN');

// Initialize session (required for storing language preference)
bot.use(session({ initial: () => ({ __lang: undefined }) }));

// Use the plugin
bot.use(
  pug({
    folder: 'locales',          // path to locale folder (optional, default: 'locales')
    defaultLocale: 'en',        // fallback locale (required)
    debug: 'none',              // debug mode (optional)
    globals: { botName: 'MyBot' }, // shared variables for all templates (optional)
    cache: true,                // cache compiled templates (optional, default: true)
    showMismatches: false,      // show missing templates across locales (optional)
  })
);

// Use in handlers
bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name ?? 'User';
  const text = ctx.t('welcome', { name, count: 5 });
  await ctx.reply(text);
});

// Switch language example
bot.command('setlang_ru', async (ctx) => {
  ctx.session.__lang = 'ru';
  await ctx.reply('Language switched to Russian!');
});

bot.start();
```

## API

### `pug(options: PugOptions): Middleware<C>`

#### Options

| Option           | Type                                                        | Default        | Description                                                                                        |
| ---------------- | ----------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| `folder`         | `string`                                                    | `'locales'`    | Path to folder containing locale subdirectories.                                                   |
| `defaultLocale`  | `string`                                                    | **(required)** | Fallback locale if user’s language is not supported.                                               |
| `debug`          | `'none' \| 'pug' \| 'plugin' \| 'all'`                      | `'none'`       | Enable debug logging of template compilation, plugin internals, or both.                           |
| `globals`        | `LocalsObject`                                              | `{}`           | Shared variables accessible in all Pug templates.                                                  |
| `filters`        | `Record<string, (text: string, options: object) => string>` | `{}`           | Custom Pug filters.                                                                                |
| `cache`          | `boolean`                                                   | `true`         | Cache compiled templates for faster repeated rendering.                                            |
| `showMismatches` | `boolean`                                                   | `false`        | Show missing templates across locales (automatically enabled in debug mode `'plugin'` or `'all'`). |

### Context Extension

The plugin adds a `t(key, variables?)` method to your context:

```ts
ctx.t('welcome', { name: 'Alice', count: 3 })
```

- `key` – Template filename without extension (e.g., `'welcome'`). Supports nested paths like `'subfolder/template'`.
- `variables` – Optional object of template variables (merged with `globals`).

### Language Detection Order

1. `ctx.session.__lang` (if session is used)
2. `ctx.from.language_code`
3. Falls back to `defaultLocale`

## Template Examples

**Simple variable interpolation** (`locales/en/hello.pug`):

```pug
| Hello, #{username}!
```

**Conditionals and loops** (`locales/en/stats.pug`):

```pug
if users.length > 0
  | Active users:
  each user in users
    | - #{user.name}
else
  | No active users.
```

**Using globals** (set via `globals: { site: 'example.com' }`):

```pug
| Visit #{site} for more info.
```

**Multiline messages** (`locales/en/help.pug`):

```pug
| Available commands:
| /start - Start bot
| /help  - Show this help
| /lang  - Change language
```

**Nested template structure** (supports subdirectories):

```
locales/en/
├── common/
│   ├── buttons.pug
│   └── footer.pug
└── main.pug
```

Usage: `ctx.t('common/buttons', { ... })`

## Advanced Usage

### Custom Pug Filters

You can define custom Pug filters in the options:

```ts
pug({
  defaultLocale: 'en',
  filters: {
    uppercase: (text) => text.toUpperCase(),
    reverse: (text) => text.split('').reverse().join(''),
  },
})
```

Then use them in templates:

```pug
| #{message | uppercase}
```

### Debug Modes

The plugin offers four debug modes:

```ts
pug({
  defaultLocale: 'en',
  debug: 'none',      // No debug output (default)
  // debug: 'pug',       // Show Pug compilation debug info
  // debug: 'plugin',    // Show plugin internals (loaded locales, mismatches)
  // debug: 'all',       // Show both Pug and plugin debug info
})
```

### Disabling Cache (Development)

For development, you can disable caching to see template changes instantly:

```ts
pug({
  defaultLocale: 'en',
  cache: false, // recompile on every render
})
```

### Template Mismatch Detection

Enable `showMismatches: true` or set `debug` to `'plugin'`/`'all'` to see which templates are missing in which locales. This helps keep your localization files synchronized.

Example output:
```json
{
  "title": "grammy-pug's debug output",
  "mismatches": {
    "en": ["missing_template"],
    "ru": ["another_missing"]
  }
}
```

## TypeScript Support

Full TypeScript definitions are included. Import the types to extend your context:

```ts
import { PugFlavor, PugOptions, PugSessionData } from 'grammy-pug';

type MyContext = Context & PugFlavor & PugSessionData;

// Use in your bot configuration
const options: PugOptions = {
  defaultLocale: 'en',
  folder: 'locales',
  debug: 'none',
};
```

## Error Handling

If a template is not found in the selected locale, an error is thrown:
```
Error: File 'welcome' in locale 'en' not exist!
```

Make sure your template files exist and are named correctly. The plugin automatically scans directories recursively for `.pug` files.

## License

MIT