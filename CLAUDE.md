# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development Workflow
- **Build**: `yarn build` - Builds the React app to the `dist` folder using Vite
- **Development**: Avoid `yarn dev` - Instead use `yarn build` and view at `http://localhost:8887/feed/`
- **Lint**: `yarn lint` - Runs ESLint with React-specific rules
- **Preview**: `yarn preview` - Serves the built application
- **Dependencies**: `yarn` - Install dependencies (prefer over npm install)

### Local Server Setup
Start a local server in the website root containing the feed folder:
```bash
cd website-root
python -m http.server 8887
```
Then view at: `http://localhost:8887/feed/` or `http://localhost:8887/feed/dist`

### Why Avoid yarn dev
The dev server doesn't properly support:
- Hash-driven widget integration with the Swiper component
- Local embedding samples (embed-player.html)
- Integration with sibling repositories (localsite, swiper)

## Architecture Overview

### Core Structure
This is a React application built with Vite that creates a **FeedPlayer** - a video/image feed viewer with swiper navigation. The app is designed to be embeddable as a web component.

### Key Components
1. **App.jsx** - Main application with navigation between FeedPlayer, MemberSense, and Discord components
2. **VideoPlayer** - Core feed player component with swiper integration
3. **MemberSense** - Discord integration for member management and channel viewing
4. **Context Providers** - Two contexts: `Context.jsx` (basic video state) and `ContextGoogle.jsx` (Google Sheets integration)

### Data Sources
The app pulls content from multiple sources:
- **Google Sheets API** - Primary data source via `ContextGoogle.jsx`
- **Static JSON/JS** - Fallback data in `src/Data/`
- **RSS/CSV/YAML feeds** - Via various API endpoints
- **Discord API** - For MemberSense functionality

### Web Component Integration
The VideoPlayer is registered as a web component (`video-player-widget`) using `react-to-webcomponent`, making it embeddable in other pages.

### Build Configuration
- **Entry point**: `feedplayer.html` (not index.html)
- **Output**: `dist/index.html` (renamed during build)
- **Assets**: Fixed naming pattern in `dist/assets/` for consistent embedding
- **Base path**: Empty string for flexible deployment

### Multi-Repository Setup
This project works alongside:
- **localsite** - Navigation and base styles
- **swiper** - Swiper component integration  
- **feed** - This repository

Place all three in the same website root directory for proper integration.

### Feed Hash System
The app uses URL hashes to specify feeds (e.g., `#list=nasa`, `#list=seeclickfix-311`). The hash system allows direct linking to specific feed configurations.

### Development Notes
- SCSS is used for styling with component-specific files
- Framer Motion provides animations
- Lucide React for icons
- The app supports both mock data and live API data for development
- Full-screen mode with custom navigation controls
- CORS passthrough available in the `view/` folder for testing feeds