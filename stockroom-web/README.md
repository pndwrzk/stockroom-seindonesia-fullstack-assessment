# Stock Opname App

A web application for managing dashboards, inventory, products, stores, users, and stock opname workflows. This frontend communicates with a backend through a REST API.

## Technologies

- **Next.js 16** with the App Router
- **React 19** and **TypeScript**
- **Tailwind CSS 4** for styling
- **shadcn/ui** and shared UI components
- **Axios** for REST API communication
- **React Hook Form** and **Zod** for form handling and validation
- **Lucide** and **Hugeicons** for icons

## Folder Structure

```text
app/
├── (auth)/                 # Authentication layout and pages, including login
└── (dashboard)/            # Dashboard layout and feature pages
    ├── inventory/          # Inventory pages
    ├── products/           # Product pages
    ├── stock-opname/       # Stock opname list and detail
    ├── stores/             # Store pages
    └── users/              # User pages
components/
├── auth/                   # Authentication components
├── navbar/                 # Navigation and breadcrumbs
├── sidebar/                # Application sidebar
└── ui/                     # Reusable UI components
config/                     # Configuration, including navigation
features/
├── auth/                   # Authentication, session, roles, and permissions
├── dashboard/              # Dashboard components and services
├── inventory/              # Inventory feature
├── products/               # Product feature
├── stock-opname/           # Stock opname feature
├── stores/                 # Store feature
└── users/                  # User feature
hooks/                      # Shared custom React hooks
lib/                        # Utilities and Axios configuration
public/                     # Static assets
types/                      # Shared TypeScript types
```

Routes are defined in `app/`, while feature implementations such as components, hooks, schemas, and API services are grouped in `features/`.

## Prerequisites

- Node.js **24.9 or later**
- npm
- A backend REST API accessible from your development environment

## Run Locally

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` and set the backend URL:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

   Replace this URL with the address of your backend. The backend must provide API endpoints under `/api/v1`. If this variable is not set, the app uses `http://localhost:3000` as the default API URL.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). You will need a valid account on the backend to sign in.

## Available Commands

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Start the production server
```

To run the app locally in production mode, run `npm run build` first, then `npm run start`.
