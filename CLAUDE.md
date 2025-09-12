# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains multiple JavaScript projects:

- **link11.v1/**: Vue 3 + Vite + Pinia SPA with routing
- **link11-nuxt/**: Nuxt 4 application with TypeScript support
- **pusher-coin/**: Vue 3 + Vite gambling/slot machine frontend with real-time chat
- **vue-tutorial/**: Basic Vue 3 learning project with WordPress integration

## Common Development Commands

### For Vue 3 + Vite projects (link11.v1, pusher-coin, vue-tutorial):

```bash
# Development
npm install
npm run dev

# Production build
npm run build
npm run preview

# Code quality (where available)
npm run lint        # ESLint with --fix
npm run format      # Prettier formatting
```

### For Nuxt project (link11-nuxt):

```bash
# Development
npm install
npm run dev

# Production
npm run build
npm run preview
npm run generate    # Static site generation
```

## Architecture Overview

### Vue 3 + Vite Projects
- **State Management**: Pinia stores (located in `/src/stores/`)
- **Routing**: Vue Router 4 (configured in `/src/router/`)
- **Entry Point**: `/src/main.js` - standard Vue 3 app setup with Pinia and Router
- **Components**: Modular Vue components in `/src/components/`
- **Services**: API integration via Axios (where used)

### Nuxt Application (link11-nuxt)
- **Structure**: Uses Nuxt 4 with app/ directory structure
- **Components**: TypeScript-enabled components in `/app/components/`
- **Types**: Custom TypeScript definitions in `/app/types/`
- **State**: Pinia with @pinia/nuxt integration
- **Utilities**: Custom utilities in `/app/utils/`

### Project-Specific Notes

**pusher-coin**: Real-time gambling application
- Uses WebSocket/Pusher for live chat functionality
- Has authentication system with login forms
- Includes betting and balance management components
- Uses IMask for input formatting

**vue-tutorial**: WordPress integration example
- Has WordPress API service in `/src/services/wordpress.js`
- Uses Axios for API calls to WordPress backend

## Development Tools

- **Node.js**: Requires v20.19.0+ or v22.12.0+ (where specified)
- **Vite**: Development server and build tool
- **ESLint**: Code linting (Vue-specific configs)
- **Prettier**: Code formatting
- **Vue DevTools**: Available via vite-plugin-vue-devtools