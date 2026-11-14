# REBEL

**Less framework. More freedom.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**REBEL** is an open-source, lightweight **Vanilla JavaScript frontend engine** created and architected by **Wilton Monroy**, and developed, published, and maintained by **CODEMAKERS LLC**.

Originally built to accelerate CODEMAKERS' internal software projects, REBEL is now available to the developer community under the MIT License.

Build interfaces with declarative configurations, reusable components, and flexible API integrations—without being tied to a specific backend technology.

> **Release status:** Early alpha (`0.1.0-alpha.8.15`). APIs and tooling may evolve. Production readiness and performance should be independently evaluated for each use case.

## Features

- **Declarative Views:** Define application interfaces through structured configurations.
- **Frontend Rendering Engine:** Render reusable views, forms, tables, and interface components.
- **Client-Side Routing:** Navigate between views without full-page reloads.
- **ConfigStore:** Load and reuse application configuration in memory for efficient navigation.
- **CRUD Utilities:** Build data-management interfaces with forms, validation, search, sorting, and pagination.
- **Responsive Interfaces:** Support desktop and mobile layouts, including card-based table presentations.
- **Theme Management:** Customize visual appearance with configurable themes, palettes, and Light/Dark modes.
- **View Designer:** Create and manage declarative view configurations.
- **Menu Designer:** Configure navigation structures and registered views.
- **Reusable Components:** Extend application functionality with project-specific components.
- **API Integration:** Connect to REST APIs implemented using the backend technology of your choice.
- **CLI Scaffolding:** Initialize a minimal prototype application.

REBEL is **backend-agnostic**. It does not require Node.js, .NET, Python, Java, or any particular backend framework to render interfaces in the browser.

Backend authorization, authentication, data persistence, and business rules remain the responsibility of the consuming application and its services.

## Requirements

- **Node.js 20+** for npm installation and CLI tooling.
- A modern browser supporting JavaScript ES Modules.
- An API backend only when your application requires server-side functionality.

## Installation

Install REBEL directly from npm:

```bash
npm install @code-makers/rebel
```

The current release is an early alpha. To explicitly install the alpha distribution:

```bash
npm install @code-makers/rebel@alpha
```

## Create Your First Project

Initialize a new project using the REBEL CLI:

```bash
mkdir my-rebel-app
cd my-rebel-app

npm init -y
npm install @code-makers/rebel

npx rebel init proto
npm start
```

The `proto` starter creates a minimal application with a Node.js demonstration server and JSON-based prototype storage.

**Important:** Node.js and `runtime.json` are used only by the demonstration starter. They are not mandatory dependencies of the REBEL frontend engine.

Developers can connect REBEL to their own APIs, storage engines, authentication services, and application architectures.

## JavaScript API

REBEL exposes reusable modules through its npm package.

```javascript
import {
  createRebelApp,
  createApiClient,
  createStore,
  createConfigStore
} from '@code-makers/rebel';

const configStore = createConfigStore();

const response = await fetch('/api/bootstrap', {
  cache: 'no-store'
});

if (!response.ok) {
  throw new Error(`Bootstrap HTTP ${response.status}`);
}

const bootstrap = await response.json();

configStore.load(bootstrap);
```

### Configuration and Bootstrap

REBEL can initialize its application configuration through a JSON bootstrap response.

Typical configuration includes:

- Registered views.
- Application modules.
- Navigation menu definitions.
- Theme settings.
- Other application-specific configuration.

The configuration is stored in memory through **ConfigStore**, allowing the frontend engine to reuse definitions during navigation.

View rendering is performed on demand, while application data can be refreshed independently through the configured APIs.

**Security note:** Client-side view visibility does not replace backend authorization. API access and permissions must be enforced by the backend.

## Architecture

REBEL follows a lightweight, modular architecture focused on separating frontend rendering from business logic.

**REBEL Engine**

Provides generic rendering, routing, interface components, themes, and reusable frontend utilities.

**Application Features**

Define views and application-specific behavior using JavaScript and declarative configurations.

**Application Components**

Contain custom components and specialized business functionality without unnecessarily expanding the core engine.

**Backend Services**

Provide application data, authorization, persistence, and business rules through APIs.

This separation allows developers to reuse REBEL across different projects without requiring a specific backend stack.

## Genesis Demo

**Genesis** is a companion demonstration application built with REBEL.

It demonstrates:

- Dynamic navigation and registered views.
- CRUD interfaces and form validation.
- Request submission and evaluation workflows.
- Dashboard and telemetry components.
- Theme Studio.
- View Designer and Menu Designer.
- Responsive interface behavior.
- REST API integration using Node.js and `runtime.json`.

Genesis is an example application and is **not included as part of the REBEL npm engine**.

## Development and Testing

Clone the official repository:

```bash
git clone https://github.com/codemakers-llc/rebel.git
cd rebel
```

Run the automated tests:

```bash
npm test
```

Inspect the npm distribution:

```bash
npm pack --dry-run
```

The current alpha maintains its frontend modules under `dist/` for compatibility with the published package and existing consumers.

Future versions may introduce additional development tooling while preserving documented public interfaces whenever possible.

## Project Links

- **npm:** https://www.npmjs.com/package/@code-makers/rebel
- **GitHub:** https://github.com/codemakers-llc/rebel
- **Issues:** https://github.com/codemakers-llc/rebel/issues
- **CODEMAKERS:** https://code-makers.com

## Origin and Authorship

REBEL originated from frontend technologies developed for CODEMAKERS projects, including CodeView.

**Original Creator, Architect and Developer:** Wilton Monroy

**Developed, Published and Maintained by:** CODEMAKERS LLC

**Country of Origin:** United States

REBEL was created to simplify application development within CODEMAKERS and subsequently released as an open-source contribution to the developer community.

For additional attribution, see [AUTHORS.md](AUTHORS.md).

## License

REBEL is released under the **MIT License**.

Copyright © 2026 CODEMAKERS LLC.

The MIT License permits commercial use, modification, distribution, and private use, subject to its terms, including preservation of the applicable copyright and permission notices.

See [LICENSE](LICENSE) for the complete license terms.

The MIT License does not grant trademark rights to the CODEMAKERS or REBEL branding.

## Contributing

Community contributions, issue reports, bug fixes, and improvement proposals are welcome.

Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting contributions or pull requests.

## Security

For responsible disclosure of security vulnerabilities, please see [SECURITY.md](SECURITY.md).

Do not commit credentials, access tokens, client information, or production data to the repository.

---

**Created by Wilton Monroy · Published by CODEMAKERS LLC**

**REBEL — Less framework. More freedom.**