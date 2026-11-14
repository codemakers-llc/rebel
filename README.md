# CODEMAKERS REBEL

**Less framework. More freedom.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**REBEL** is an open-source, lightweight **Vanilla JavaScript frontend engine** created, architected, and originally developed by **Wilton Monroy**, and published and maintained by **CODEMAKERS LLC**.

REBEL helps developers build browser applications with declarative views, reusable UI components, client-side navigation, configurable themes, and REST API integration—without locking the frontend to a particular backend framework.

> **Release status:** REBEL is in early alpha (`0.1.0-alpha.8.16`). APIs and CLI commands may change before a stable release.

## Features

- Declarative views, client-side navigation, and reusable UI components.
- `ConfigStore` for application configuration loaded at bootstrap.
- Forms, CRUD utilities, validation, pagination, responsive layouts, and notifications.
- Configurable themes, palettes, and light/dark appearance.
- View and menu configuration utilities.
- REST API integration independent of the backend technology.
- A minimal runnable starter generated with `rebel init proto`.

REBEL runs in the browser. Authentication, authorization, data persistence, and business rules belong to the consuming application and its backend. Client-side UI permissions are not a substitute for server-side authorization.

## Install

After `0.1.0-alpha.8.16` is published to npm:

```bash
npm install @code-makers/rebel@0.1.0-alpha.8.16
```

Package: https://www.npmjs.com/package/@code-makers/rebel

## Quick start: minimal prototype

Create an empty folder and install REBEL:

```bash
mkdir my-rebel-app
cd my-rebel-app
npm init -y
npm install @code-makers/rebel@0.1.0-alpha.8.16
npx --no-install rebel init proto
npm start
```

Open **http://localhost:3100**.

`rebel init proto` generates a **minimal starter project**, not the full Genesis reference application. Its Node.js server and example JSON storage are provided only for convenient prototyping; they are not required by REBEL's browser engine.

## Use REBEL in an application

```js
import { createConfigStore } from '@code-makers/rebel';

const configStore = createConfigStore();
const response = await fetch('/api/bootstrap', { cache: 'no-store' });
if (!response.ok) throw new Error(`Bootstrap HTTP ${response.status}`);
configStore.load(await response.json());
```

The consuming application defines its views, modules, navigation, API endpoints, and business data. REBEL can keep bootstrap configuration in memory; application record freshness depends on the application's API integration.

## Genesis: official reference application

**CODEMAKERS REBEL Genesis** is a separate demonstration application built with REBEL installed from npm. It showcases dashboards, catalogs, request workflows, View Designer, Menu Designer, Theme Studio, and a sample Node.js API with `runtime.json` storage.

Genesis is **not bundled** with the REBEL npm package. Its own public repository is planned under `codemakers-llc/rebel-genesis`. The `rebel init proto` command currently creates only the minimal starter.

## Development and verification

The CLI and development tooling require Node.js 20 or later. The frontend runtime requires a modern browser.

```bash
npm test
npm pack --dry-run
```

Before releasing a new version, test the packed tarball in a clean project and verify the generated starter in a browser. The `dist/` files are part of the published package; changes to exported APIs and paths should be managed carefully.

## Project links

- **Source code:** https://github.com/codemakers-llc/rebel
- **npm:** https://www.npmjs.com/package/@code-makers/rebel
- **CODEMAKERS LLC:** https://code-makers.com

## Authorship

**Original creator, architect, and developer:** Wilton Monroy  
**Publisher and maintainer:** CODEMAKERS LLC

REBEL evolved from frontend technology developed for CODEMAKERS applications, including CodeView. See [AUTHORS.md](AUTHORS.md).

## License

REBEL is released under the [MIT License](LICENSE). Copyright © 2026 CODEMAKERS LLC. The MIT License permits use, modification, and redistribution subject to its conditions. It does not itself grant rights to CODEMAKERS or REBEL trademarks and branding.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Never commit credentials, confidential client data, or production secrets.

---

**Created by Wilton Monroy · Published by CODEMAKERS LLC**  
**REBEL — Less framework. More freedom.**
