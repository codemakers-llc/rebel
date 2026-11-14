# REBEL

**Less framework. More freedom.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

REBEL is an open-source, lightweight **Vanilla JavaScript frontend engine** created by **Wilton Monroy** and published by **CODEMAKERS LLC**. It was originally developed to accelerate CODEMAKERS applications and is now being shared with the developer community.

> **Status:** Early alpha (`0.1.0-alpha.8.15`). APIs and tooling may change. Do not describe this release as production certified or independently benchmarked.

## What REBEL provides

- Declarative views, a view renderer and client-side routing.
- `ConfigStore` for loading and reusing bootstrap view definitions in memory.
- Reusable components, forms, CRUD helpers, pagination and toasts.
- Theme management and UI tools, including View Designer and Menu Designer.
- Optional CLI scaffolding for a small prototype application.

REBEL **does not require a particular backend**. It runs in the browser and can consume APIs implemented in Node.js, .NET, Python, Java, and other technologies. REBEL does not enforce backend authentication or permissions.

## Requirements

- Node.js 20 or newer for installation/CLI and the included prototype server.
- A modern browser for the frontend runtime.

## Install and initialize a prototype

Create an empty project, install REBEL, then initialize its minimal Node.js demonstration backend:

```bash
mkdir my-rebel-app
cd my-rebel-app
npm init -y
npm install @code-makers/rebel@alpha
npx rebel init proto
npm start
```

The `proto` starter includes a Node.js server and `runtime.json` solely as an **example**; the REBEL engine itself remains independent of Node.js at runtime. Run `rebel init proto` from a project with `@code-makers/rebel` already installed.

**Before the first npm publication**, use a local tarball to verify the same CLI workflow. These registry commands become usable only once the scoped package is actually published.

## JavaScript API

```js
import { createRebelApp, createApiClient, createStore, createConfigStore } from '@code-makers/rebel';

// Your application can obtain a compatible JSON bootstrap from any server.
const store = createConfigStore();
const bootstrap = await fetch('/api/bootstrap').then((response) => {
  if (!response.ok) throw new Error(`Bootstrap HTTP ${response.status}`);
  return response.json();
});
store.load(bootstrap);
```

**Bootstrap contract:** `views`, `modules`, and `menuItems` must be arrays. The app controls which views are returned. Role-based presentation is not a substitute for backend authorization.

## Repository and companion demo

- **Engine source:** https://github.com/codemakers-llc/rebel
- **npm package:** https://www.npmjs.com/package/@code-makers/rebel (after publication)
- **Company:** https://code-makers.com

**Genesis** is a separate example application using REBEL with a Node.js API and `runtime.json` for prototype data. It is **not part of the npm engine**.

## Development

```bash
npm test
npm pack --dry-run
```

The existing engine implementation is in `dist/`. This alpha repository preserves those module paths for compatibility. A future build pipeline may reorganize sources; avoid renaming exports or published asset paths without a migration plan.

## Origin and authorship

REBEL originated from internal frontend technology built for CODEMAKERS projects, including CodeView. **Original creator, architect and developer: Wilton Monroy. Publisher and maintainer: CODEMAKERS LLC.** See [AUTHORS.md](AUTHORS.md).

## License

[MIT](LICENSE). Copyright © 2026 CODEMAKERS LLC, **subject to verification of rights ownership before the public release**. MIT permits commercial use, modification and redistribution while requiring preservation of the license and copyright notice. It does not grant exclusive rights to the CODEMAKERS name or branding.

## Security

Please see [SECURITY.md](SECURITY.md) for responsible disclosure. Never commit client secrets, credentials, personally identifiable information or production data to this repository.
