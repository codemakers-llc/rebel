# CODEMAKERS REBEL

**Less framework. More freedom.**

[![npm](https://img.shields.io/npm/v/@code-makers/rebel.svg)](https://www.npmjs.com/package/@code-makers/rebel)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)

**REBEL** is a lightweight, modular frontend framework built with Vanilla JavaScript. It helps developers create responsive web applications using reusable UI components, declarative views, REST API integration, CRUD interfaces, dashboards, and visual design tools.

No mandatory frontend framework. No required bundler. No imposed backend architecture.

Use the components you need and keep control of your application.

**Creator, architect and original developer:** [Wilton Monroy](https://github.com/WiltonMonroy)

**Publisher and maintainer:** [CODEMAKERS LLC](https://github.com/codemakers-llc)

**Current documented release:** `0.1.0-alpha.8.18`

---

## Why REBEL?

REBEL was designed to simplify frontend development without sacrificing flexibility.

Instead of requiring developers to adopt an entire application architecture, REBEL provides independent building blocks that can be integrated into new or existing projects.

Key principles:

- **Lightweight:** Vanilla JavaScript without a mandatory frontend framework.
- **Modular:** Use the components and utilities your project needs.
- **Backend-independent:** Connect to existing REST APIs.
- **Responsive:** Build interfaces for desktop, tablet, and mobile.
- **Customizable:** Adapt layouts, themes, palettes, and navigation.
- **Developer-friendly:** Generate working examples with the REBEL CLI.

---

## Requirements

- Node.js 20 or later.
- npm.
- Git and internet access when downloading remote templates.

## Quick Start

### Create a new REBEL application

```bash
mkdir my-rebel-app
cd my-rebel-app

npm init -y
npm install @code-makers/rebel

npx --no-install rebel init new

npm install
npm start
```

The command generates an Enterprise Starter with working frontend examples and a lightweight demonstration runtime.

**Note:** The unversioned installation command uses npm's `latest` distribution tag. For the documented release, install `@code-makers/rebel@0.1.0-alpha.8.18` explicitly until that version is confirmed as `latest`.

### Explore Genesis Forma

Genesis Forma is the advanced reference application for REBEL.

```bash
mkdir rebel-genesis
cd rebel-genesis

npm init -y
npm install @code-makers/rebel

npx --no-install rebel init proto
```

Genesis is downloaded from its independent Git repository.

Follow the generated project's startup instructions after initialization.

---

## REBEL CLI

The REBEL CLI provides commands for generating starter applications and exploring working examples.

| Command | Description |
|---|---|
| `rebel init new` | Generate the bundled Enterprise Starter |
| `rebel init new --local PATH` | Initialize using a local starter repository |
| `rebel init new --repo URL` | Download a starter from a Git repository |
| `rebel init blank` | Alias for `init new` in this alpha release |
| `rebel init proto` | Download the Genesis reference application |
| `rebel init proto --ref TAG` | Download a specific Genesis tag or branch |
| `rebel init proto --local PATH` | Initialize Genesis from local source |
| `rebel --version` | Show the installed REBEL version |
| `rebel --help` | Display available commands |

Use the CLI within a project where REBEL is installed:

```bash
npx --no-install rebel --help
```

### Generate INIT NEW directly from GitHub

```bash
npx --no-install rebel init new --repo https://github.com/codemakers-llc/rebel-init-starter.git
```

This option downloads the starter from GitHub instead of using the template bundled inside the npm package.

---

## Enterprise Starter

The Enterprise Starter demonstrates how REBEL components can be combined into a functional frontend application.

### Demo

Includes working examples of:

- KPI dashboards and reusable widgets.
- Synthetic telemetry.
- Responsive tables and CRUD interfaces.
- Dynamic forms and field validation.
- Request creation and review workflows.
- Example modules and navigation.
- Modal dialogs and toast notifications.

### Designer

Provides frontend configuration tools:

- **View Designer:** Configure application views.
- **Menu Designer:** Organize application navigation.
- **Theme Studio:** Customize themes and palettes.

### Audit

Includes an Audit Trail demonstration for inspecting example activity records.

### Initial experience

The starter includes:

- One initial **Demo** profile.
- Three navigation sections: **Demo**, **Designer**, and **Audit**.
- **Minimal Light** as the initial theme.
- Dark theme support.
- Responsive application layouts.
- Example data for testing and demonstration.

The starter uses a lightweight Node.js server and JSON persistence for rapid prototyping. The demonstration server is not a required part of the REBEL frontend engine.

---

## Features

### Declarative frontend rendering

Create and manage application views using reusable configuration patterns.

### REST API integration

Connect frontend interfaces to backend services using the REBEL API client.

### CRUD interfaces

Build application screens with reusable tables, forms, validation, and record actions.

### Responsive components

Use layouts and controls designed to adapt across different screen sizes, including mobile-friendly table cards.

### Dashboards and widgets

Compose reusable dashboards with independent widgets and controlled refresh behavior.

Dashboard data loads when entering a view, with manual refresh available when needed. REBEL does not require continuous API polling.

### Themes and personalization

Customize light and dark appearances, palettes, and CSS design tokens.

### Visual designers

Create and manage frontend views, menus, and appearance configurations with REBEL's design utilities.

### Application shell

Use optional components for landing screens, navigation, user menus, modal dialogs, and application presentation.

---

## Architecture

REBEL is a frontend-focused JavaScript framework.

Its core rendering engine can be integrated with existing applications and REST APIs without requiring a specific database, server framework, or ORM.

The consuming application controls its own:

- Backend services.
- Authentication and authorization.
- Business rules.
- Database and storage.
- API endpoints.
- Deployment infrastructure.

**Security:** Frontend roles, menus, and visibility rules do not replace backend authorization. Production access control must be enforced by the consuming application's server.

For demonstrations, use synthetic or deliberately public information.

---

## Repositories

| Repository | Purpose |
|---|---|
| [REBEL Engine](https://github.com/codemakers-llc/rebel) | Core frontend framework and CLI |
| [REBEL INIT Starter](https://github.com/codemakers-llc/rebel-init-starter) | Enterprise Starter template |
| [Genesis Forma](https://github.com/codemakers-llc/rebel-genesis) | Advanced reference application |

REBEL can be installed independently through npm. The example applications are provided to demonstrate its capabilities.

---

## Development

Clone the repository:

```bash
git clone https://github.com/codemakers-llc/rebel.git
cd rebel

npm install
npm test
```

### Validate a release package

Before publishing:

```bash
npm test
npm pack --dry-run
npm pack
```

The published package must contain all assets required by the CLI, including the bundled INIT NEW template.

Test the generated `.tgz` in a clean directory before publishing. A successful Engine test run alone does not guarantee that the npm package contains the complete starter.

### Publishing

For maintainers, publish verified prereleases using:

```bash
npm publish --access public --tag alpha
```

Check published versions and distribution tags:

```bash
npm view @code-makers/rebel version
npm dist-tag ls @code-makers/rebel
```

npm package versions are immutable. Fixes to an already published version require a new release number.

---

## Contributing

Community contributions are welcome.

You can help by:

- Reporting reproducible bugs.
- Improving documentation.
- Suggesting reusable frontend components.
- Contributing accessibility and responsive UI improvements.
- Submitting focused pull requests with tests.

Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before contributing.

## License

REBEL is distributed under the [MIT License](LICENSE).

Original creator, architect and developer: **Wilton Monroy**.

Publisher and maintainer: **CODEMAKERS LLC**.

Copyright and ownership attribution are governed by the repository's [LICENSE](LICENSE) and [AUTHORS.md](AUTHORS.md) files.

The MIT License does not grant rights to use CODEMAKERS or REBEL trademarks.

---

**Built at CODEMAKERS. Shared with developers.**

**REBEL — Less framework. More freedom.**