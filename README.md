<h1 style="text-align: center;" >Grammy-Pug</h1>

A lightweight and flexible i18n (internationalization) plugin for [Grammy](https://grammy.dev) that uses [Pug](https://pugjs.org) templates for localization.  

Render dynamic, locale-specific messages with ease using Pug’s powerful templating syntax.

---

## Features

- **Pug‑based templates** – Use loops, conditionals, variables, and includes directly in your locale files.
- **Automatic locale detection** – Detects user language from `ctx.from.language_code`.
- **Lightweight** – Minimal dependencies, fast filesystem-based loading.

---

## Installation

```bash
npm i grammy-pug
# or
yarn add grammy-pug
```

---

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

2. **Write Pug templates** (example `locales/en/welcome.pug`):

```pug
| Hello, #{name}! Welcome to #{botName}.
| You have #{count} new messages.
```

3. **Set up the plugin in your bot**:

```ts
import { Bot, Context } from "grammy"
import { pug, PugFlavor } from "grammy-pug"

// Extend your context type
type MyContext = Context & PugFlavor

const bot = new Bot<MyContext>("BOT_TOKEN")

// Use the plugin
bot.use(
  pug({
    folder: "locales",          // path to locale folder (optional, default: "locales")
    defaultLocale: "en",        // fallback locale (required)
    isDebug: false,             // enable debug logs (optional)
    globals: { botName: "MyBot" }, // shared variables for all templates (optional)
  })
)

// Use in handlers
bot.command("start", async (ctx) => {
  const name = ctx.from?.first_name ?? "User"
  const text = ctx.locale.get("welcome", { name, count: 5 })
  await ctx.reply(text)
})

bot.start()
```

---

## API

### `pug(options: PugOptions): Middleware<C>`

#### Options

| Option          | Type           | Default        | Description                                               |
| --------------- | -------------- | -------------- | --------------------------------------------------------- |
| `folder`        | `string`       | `"locales"`    | Path to folder containing locale subdirectories.          |
| `defaultLocale` | `string`       | **(required)** | Fallback locale if user’s language is not supported.      |
| `isDebug`       | `boolean`      | `false`        | Enable debug logging (prints context and rendering info). |
| `globals`       | `LocalsObject` | `{}`           | Shared variables accessible in all Pug templates.         |

### Context Extension

The plugin adds a `locale.get(key, variables?)` method to your context:

```ts
ctx.locale.get("welcome", { name: "Alice", count: 3 })
```

- `key` – Template filename without extension (e.g., `"welcome"`).
- `variables` – Optional object of template variables.

---

## 🧩 Template Examples

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

**Using globals** (set via `globals: { site: "example.com" }`):

```pug
| Visit #{site} for more info.
```

---

## License

MIT