# Bloom Affordable Housing Platform

Bloom is [Exygy](https://www.exygy.com/)’s affordable housing platform. Bloom's goal is to be a single entry point for affordable housing seekers and application management for developers. You can read more about the platform on [bloomhousing.com](https://bloomhousing.com/).

## Overview

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![cypress](https://img.shields.io/badge/-cypress-%23E5E5E5?style=for-the-badge&logo=cypress&logoColor=058a5e) ![Testing-Library](https://img.shields.io/badge/-TestingLibrary-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white)

Bloom consists of a client/server architecture using [Next.js](https://nextjs.org) for the frontend applications and [NestJS](https://nestjs.com), [Prisma](https://www.prisma.io/), and [Postgres](https://www.postgresql.org/) on the backend.

### Structure

Bloom uses a monorepo-style repository containing multiple user-facing applications and backend services. The three main high-level packages are `api`, `sites`, and `shared-helpers`. Additionally, Bloom's UI leverages the in-house packages `@bloom-housing/ui-seeds` and `@bloom-housing/ui-components`.

The `sites` folder contains reference implementations for both the public and partner applications:

---

- `sites/public` is the applicant-facing site available to the general public. It provides the ability to browse and apply for available listings either using the Common Application (which we build and maintain) or an external link to a third-party online or paper application.
- Visit [sites/public/README](https://github.com/bloom-housing/bloom/blob/main/sites/public/README.md) for more details.

- `sites/partners` is the site designed for housing developers, property managers, and city/county (jurisdiction) employees. For application management, it offers the ability to view, edit, and export applications for listings and other administrative tasks. For listing management, it offers the ability to create, edit, and publish listings. A login is required to use the Partners Portal.
- Visit [sites/partners/README](https://github.com/bloom-housing/bloom/blob/main/sites/partners/README.md) for more details.

---

- `api` is the container for the key backend services (e.g. listings, applications, users). Information is stored in a Postgres database and served over HTTPS to the front-end (either at build time for things that can be server-rendered, or at run time). Services expose a REST API.
- Visit [api/README](https://github.com/bloom-housing/bloom/blob/main/api/README.md) for more details.

---

- `shared-helpers` contains types, functions, and components that are shared between the public and partners sites.
- Visit [shared-helpers/README](https://github.com/bloom-housing/bloom/blob/main/shared-helpers/README.md) for more details.

---

- `@bloom-housing/ui-seeds` (Seeds) is our component library based on our internal design system. It is comprised of React components and design system tokens. The published ui-seeds [Storybook](https://storybook.js.org/) can be found [here](https://storybook-ui-seeds.netlify.app/?path=/story/tokens-introduction--page). For further details visit the [ui-seeds repository](https://github.com/bloom-housing/ui-seeds) and our [external design documentation](https://zeroheight.com/5e69dd4e1/p/938cb5-seeds-design-system) on Zeroheight.

- `@bloom-housing/ui-components` (UIC) is also an internal component library - but it is being slowly replaced with `ui-seeds` which is the next iteration. The published ui-components storybook can be found [here](https://storybook.bloom.exygy.dev/). For further details visit the [ui-components repository](https://github.com/bloom-housing/ui-components).

## Getting started for developers

If this is your first time working with Bloom, please be sure to check out the `sites/public`, `sites/partners`, and `api` README files for important and specific configuration information. After doing so, you can proceed with the below setup instructions.

## Starting locally

### Dependencies

Run `yarn install` at root and from within the api directory.

If you don't have yarn installed, you can install homebrew with [these instructions](https://brew.sh/) and then do so with `brew install yarn`.

### Local environment variables

Configuration of each app and service is read from environment variables. There is an `.env.template` file in `sites/public`, `sites/partners`, and `api` that must be copied to an `.env` at the same level. Some keys are secret and are internally available in a password manager - you can request access through the current team. The template files include default values and descriptions of each variable.

### VSCode Extensions

If you use VSCode, these are some recommended extensions.

With the [Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) installed, ⌘⇧P Open User Settings, search for and enable `Format on Save`, and then ⌘⇧P Reload Window. When you save a file locally, it should automatically format according to our configuration.

The [Postgres explorer plugin](https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres) will let you inspect your local database (more setup instructions in the [api README](https://github.com/bloom-housing/bloom/blob/main/api/README.md)).

The [Code Spell Checker plugin](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) will flag spelling errors.

The [CSS variable autocomplete plugin](https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables&ssr=false#overview) will pull in all CSS variable definitions from ui-seeds for autocompletion (more setup instructions in the [public README](https://github.com/bloom-housing/bloom/blob/main/sites/public/README.md)).

The [CSS module autocomplete plugin](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules) which provides autocomplete for CSS module files.

### Running a local test server

Running `yarn dev:all` from root runs 3 processes for both apps and the backend services on 3 different ports:

- 3000 for the public app
- 3001 for the partners app
- 3100 for the api

You can also run each process individually from separate terminals with the following command in each directory: `yarn dev`.

We have a number of default users seeded for local development, the most basic of which being (email: `admin@example.com`, password: `abcdef`) which will login to both the public and partners sites, but you can view other default seeded users and their permissions by checking out the user section of the [seed file](https://github.com/bloom-housing/bloom/blob/aed77bf06525be359ef9205044fabbea2ab2576d/api/prisma/seed-staging.ts#L67).

### Bloom UIC development

Because Bloom's ui-components package is a separate open source repository, developing in Bloom while concurrently iterating in ui-components requires linking the folders with the following steps:

### Directory setup

1. Clone both Bloom and the [ui-components repository](https://github.com/bloom-housing/ui-components) on the same directory level.

### Symlinking UIC

1. In the Bloom directory, run `yarn link:uic`.
2. Open the next.config.js file in the public and partner's directory.
3. Uncomment the experimental property at the bottom of each file.
4. Follow the directions above to run Bloom locally.
   These steps allow you to edit your local version of ui-components and the changes will be reflected in the node_modules in Bloom.

### Unlinking UIC

1. In the Bloom directory, run `yarn unlink:uic`.
2. Open the next.config.js file in the public and partner's directory.
3. Comment out the experimental property at the bottom of each file.
4. Follow the directions above to run Bloom locally.
   Bloom will now be consuming the published version of @bloom-housing/ui-components specified in package.json and no local ui-component changes will be reflected.

## Contributing

Contributions to the core Bloom applications and services are welcomed. To help us meet the project's goals around quality and maintainability, we ask that all contributors read, understand, and agree to our guidelines.

### Issue tracking

Our development tasks are managed through GitHub issues and development in the vast majority of cases should be tied to an issue. Please feel free to submit issues even if you don't plan on implementing them yourself. Before creating an issue, check first to see if one already exists. When creating an issue, give it a descriptive title and include screenshots if relevant. Please don't start work on an issue without checking in with the Bloom team first as it may already be in development! You can tag us (@ludtkemorgan, @emilyjablonski, @yazeedloonat) to get started on an issue or ask any questions.

### Committing

We are also using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), a specification for commit messages that indicates what type and level of change each commit is.

On commit, two steps automatically run: (1) linting and (2) a verification of the conventional commit standard. You can either, instead of running `git commit`, globally install commitizen (`npm install -g commitizen`) and then commit with `git cz` which will run a commit message CLI (the CLI asks a series of questions about your changeset and builds the commit message for you in the conventional commit format), or alternatively run `git commit` with your own message if you are confident it follows the conventional standard, and the linter will fail if it does not.

### Pull Requests

Pull requests are opened to the main branch. When opening a pull request please fill out the entire pull request template which includes tagging the issue your PR is related to, a description of your PR, including details for the reviewer about how to test your PR, and a testing checklist.

When your PR is ready for review, add the `needs review(s)` label to surface it to our internal team. If you put up a PR that is not yet ready for eyes, add the `wip` label.

As a reviewer on a PR, try not to leave only comments, but a clear next step action. If the PR requires further discussion or changes, mark it with Requested Changes. If a PR looks good to you (or even if there are small changes requested that won't require an additional review), please mark it with Approved and comment on the last few changes needed. This helps other reviewers better understand the state of PRs at the list view and prevents an additional unnecessary review cycle.
