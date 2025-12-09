# Arc Raiders Bounty System

A multi-platform bounty system for Arc Raiders with Steam, Xbox, and PlayStation player verification.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

## Environment Variables

The application requires several API keys for player verification. These should be set as environment variables in your Vercel project or `.env` file.

### Required Variables

#### Steam API (Required for Steam verification)
- **`STEAM_API_KEY`** or **`VITE_STEAM_API_KEY`**
  - Get your key at: https://steamcommunity.com/dev/apikey
  - Free to use
  - Rate limit: ~100,000 requests/day

#### Xbox Live API (Required for Xbox verification)
- **`OPENXBL_API_KEY`**
  - Get your key at: https://xbl.io/
  - Free tier: 120 requests/hour
  - Paid tiers available for higher limits
  - Sign up and get API key from the dashboard

#### PlayStation Network API (Required for PSN verification)
- **`PSN_NPSSO`**
  - **How to get your NPSSO token:**
    1. Visit https://www.playstation.com and sign in with your PlayStation account
    2. In the same browser, navigate to https://ca.account.sony.com/api/v1/ssocookie
    3. Copy the value of the `npsso` field (a long string)
    4. Add it as the `PSN_NPSSO` environment variable
  - **Important:**
    - The NPSSO token expires after ~2 months and needs manual refresh
    - Keep this token secret - it's equivalent to your PlayStation password
    - Don't commit it to version control

### Supabase Variables
- **`VITE_SUPABASE_URL`** - Your Supabase project URL
- **`VITE_SUPABASE_ANON_KEY`** - Your Supabase anonymous key

### Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Redeploy your application

### Fallback Behavior

If API keys are not configured, the endpoints will fall back to "validation-only" mode:
- Basic format validation is performed
- No real API calls are made
- Placeholder data is returned
- Users will see a note indicating validation-only mode is active

For production use, all API keys should be properly configured.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)

```sh
# When using CI, the project must be built first.
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chrome
npm run test:e2e -- --env chrome
# Runs the tests of a specific file
npm run test:e2e -- tests/e2e/example.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```
    
### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
