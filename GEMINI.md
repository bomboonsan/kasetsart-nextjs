# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It appears to be a web application skeleton with a predefined file structure but no implemented logic.

**Key Technologies:**

*   **Framework:** Next.js
*   **UI:** React
*   **Styling:** Tailwind CSS
*   **Authentication:** next-auth (dependency present, but not implemented)

**Architecture:**

The project uses the Next.js `app` directory for routing. It includes a `(protect)` group for routes that require authentication, and a `/login` route. The component-based structure is evident from the `components` directory, which is organized into `layout` and `ui` subdirectories.

# Building and Running

**Development:**

To run the development server, use one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**Building:**

To build the application for production, run:

```bash
npm run build
```

**Linting:**

To run the linter, use:

```bash
npm run lint
```

# Development Conventions

*   **Routing:** The project uses the Next.js App Router.
*   **Protected Routes:** Routes within the `app/(protect)` directory are intended to be protected and require authentication.
*   **Styling:** The project is set up with Tailwind CSS. Utility classes should be used for styling.
*   **Components:** Reusable components are located in the `components` directory.
*   **Fonts:** The project uses `next/font` to load the Geist font.
