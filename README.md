# Arc Raiders Bounty System

<div align="center">

![Arc Raiders Logo](public/arc-logo.png)

**A multi-platform bounty tracking and leaderboard system for the Arc Raiders community**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Technical Challenges](#technical-challenges--solutions) • [Skills](#skills-demonstrated)

</div>

---

## Overview

The Arc Raiders Bounty System is a comprehensive community-driven platform that allows players to create bounties, track player eliminations, compete on leaderboards, and earn achievements. Built with modern web technologies, it features cross-platform support for Steam, Xbox, and PlayStation players.

### 🎯 Project Highlights

- **Full-Stack TypeScript Application** with end-to-end type safety
- **Real-time Features** using Supabase subscriptions for live updates
- **Secure Authentication** with multiple OAuth providers (Steam OpenID, Email/Password)
- **Database Design** with PostgreSQL, including complex queries and Row Level Security
- **Responsive Design** optimized for desktop and mobile devices
- **Production-Ready** with comprehensive testing, linting, and CI/CD configuration

### 📊 Project Stats

- **79 Vue Components** - Modular, reusable component architecture
- **98 Source Files** - Well-organized TypeScript/Vue codebase
- **160+ Git Commits** - Active development with clear commit history
- **30+ Routes** - Complex SPA with protected routes and role-based access
- **Multi-Platform** - Steam, Xbox, PlayStation player support

### 💡 Why This Project?

This project was created to solve a real community need while demonstrating professional-grade full-stack development skills. It showcases:

- **Product Thinking** - Understanding user needs and translating them into features
- **Technical Architecture** - Making informed decisions about tech stack and design patterns
- **End-to-End Development** - From database design to UI/UX implementation
- **Production Mindset** - Security, testing, performance, and maintainability
- **Community Engagement** - Building tools that real users depend on

## Features

### Core Functionality

- **Bounty Management**
  - Create and manage bounties on specific players
  - Claim bounties with proof of elimination
  - Admin verification system for bounty claims
  - Automatic bounty expiration system
  - Share bounties with social media integration

- **Player Profiles & Rankings**
  - Detailed player profiles with statistics
  - Multiple leaderboards (Bounty Hunters, Rat Player Killers)
  - Trophy wall to showcase achievements
  - Notoriety level system based on player activity
  - Rank badges and progression system

- **Authentication & Verification**
  - Multi-platform support (Steam, Xbox, PlayStation)
  - Steam OpenID authentication with full API verification
  - Email/password authentication via Supabase Auth
  - Platform-specific player verification
  - Clan tag validation and display

- **Achievements System**
  - Unlockable achievements for various milestones
  - Achievement badges and notifications
  - Trophy collection and display
  - Seasonal achievement tracking

- **Community Features**
  - Activity feed showing recent bounty actions
  - "Rat of the Day" feature highlighting top players
  - Community role selection (Bounty Hunter or Rat Player Killer)
  - Role-based statistics and leaderboards
  - Bug reporting system

- **Admin Panel**
  - User management dashboard
  - Bounty claim verification interface
  - Bug report management
  - Rat of the Day administration
  - User analytics and statistics

### Technical Features

- **Modern Stack**
  - Vue 3 with Composition API and `<script setup>` syntax
  - TypeScript 5.9 with strict mode for type safety
  - Pinia for centralized state management
  - Vue Router with route guards and lazy loading
  - Tailwind CSS for utility-first responsive styling

- **Database & Backend**
  - Supabase PostgreSQL with complex relational schemas
  - Real-time data synchronization with WebSocket subscriptions
  - Row Level Security (RLS) policies for data protection
  - Custom database functions and triggers
  - Edge functions for serverless API endpoints

- **Architecture & Best Practices**
  - Component-based architecture with reusable UI components
  - Composables for shared business logic (useAuth, useToast, etc.)
  - Type-safe API layer with TypeScript interfaces
  - Separation of concerns (lib/ for business logic, components/ for UI)
  - Error handling and loading states throughout the application

- **Developer Experience**
  - Hot module replacement for rapid development
  - End-to-end testing with Nightwatch
  - Unit testing with Vitest
  - ESLint and Prettier for consistent code quality
  - TypeScript strict mode for compile-time safety
  - Automated build scripts and pre-deployment checks

## Demo

🚀 **Live Application**: [www.dont-shoot.com](https://www.dont-shoot.com)

### 🔗 Quick Links for Recruiters

Want to see specific aspects of the code?

- **[Authentication Logic](src/lib/auth.ts)** - Multi-provider auth implementation
- **[Database Layer](src/lib/db.ts)** - PostgreSQL queries and data operations
- **[Vue Components](src/components/)** - Reusable UI component library
- **[State Management](src/stores/)** - Pinia stores with TypeScript
- **[API Integration](src/lib/platformVerification.ts)** - Steam API integration
- **[Composables](src/composables/)** - Shared business logic (useAuth, useToast)
- **[Route Guards](src/router/index.ts)** - Protected routes and role-based access
- **[TypeScript Types](src/lib/)** - Type definitions and interfaces

## Screenshots

<div align="center">
  <img src="public/bounty-hunter.jpg" alt="Bounty Hunter View" width="45%">
  <img src="public/og-image.png" alt="Platform Overview" width="45%">
</div>

## Installation

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm or yarn package manager
- Supabase account (free tier available)
- Steam API Key (optional, for Steam verification)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/FDekinder/arc-raiders-bounty.git
   cd arc-raiders-bounty
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Steam API (Optional - for Steam verification)
   VITE_STEAM_API_KEY=your-steam-api-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## Configuration

### Environment Variables

| Variable | Required | Description | How to Obtain |
|----------|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `VITE_STEAM_API_KEY` | No | Steam Web API key for player verification | [Steam API Keys](https://steamcommunity.com/dev/apikey) |

### Platform Verification

- **Steam**: Full API verification with real-time player data lookup
- **Xbox**: Format validation (gamertag structure)
- **PlayStation**: Format validation (PSN ID structure)

### Database Setup

1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   npm run db:migrate
   ```
3. Seed initial achievements:
   ```bash
   npm run db:seed-achievements
   ```

### Deployment

The project is configured for deployment on Vercel:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   npm run predeploy  # Lints, type-checks, and builds
   vercel --prod
   ```

3. **Configure environment variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables from the `.env` file

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Nightwatch |
| `npm run lint` | Lint and fix code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed-achievements` | Seed achievement data |
| `npm run db:list-users` | List all registered users |

## Technical Challenges & Solutions

### Cross-Platform Authentication
**Challenge**: Integrate multiple authentication providers (Steam, Email/Password) with different OAuth flows.

**Solution**: Built a unified authentication layer that abstracts provider-specific logic, using Steam OpenID for PC players and Supabase Auth for flexible email-based authentication. Implemented secure session management with JWT tokens and automatic token refresh.

### Real-Time Data Synchronization
**Challenge**: Keep bounty claims, leaderboards, and activity feeds synchronized across multiple users in real-time.

**Solution**: Leveraged Supabase real-time subscriptions to push database changes to connected clients instantly. Implemented optimistic UI updates for better perceived performance while maintaining data consistency.

### Platform Verification System
**Challenge**: Verify player identities across Steam, Xbox, and PlayStation platforms with varying API availability.

**Solution**: Integrated Steam Web API for full verification of PC players. For console platforms with limited API access, implemented client-side validation with future-proof architecture to add full verification when APIs become available.

### Scalable Database Design
**Challenge**: Design a relational database schema that supports complex queries while maintaining performance.

**Solution**: Created normalized database tables with proper indexing, foreign key constraints, and Row Level Security policies. Implemented PostgreSQL functions for complex operations like leaderboard calculations and achievement tracking.

### Performance Optimization
**Challenge**: Ensure fast page loads and smooth user experience with large datasets.

**Solution**: Implemented route-based code splitting, lazy loading of components, and pagination for large lists. Used Vue's computed properties and watchers efficiently to minimize unnecessary re-renders.

## Documentation

### Project Structure

```
arc-raiders-bounty/
├── src/
│   ├── assets/          # Static assets (images, styles)
│   ├── components/      # Vue components
│   │   ├── admin/       # Admin panel components
│   │   └── icons/       # Icon components
│   ├── composables/     # Vue composables (useAuth, useToast, etc.)
│   ├── lib/             # Utility functions and services
│   │   ├── auth.ts      # Authentication logic
│   │   ├── db.ts        # Database queries
│   │   ├── achievements.ts
│   │   └── platformVerification.ts
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia state stores
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── api/                 # Serverless API functions
├── public/              # Public static files
├── scripts/             # Database and utility scripts
└── tests/               # Test files (unit & e2e)
```

### Key Components

- **Authentication**: Multi-provider auth with Steam OpenID and Supabase Auth
- **Bounty System**: Create, claim, and verify player bounties
- **Leaderboards**: Rank players by various metrics
- **Achievements**: Track and reward player milestones
- **Admin Tools**: Comprehensive moderation and management interface

### API Integration

The application uses Supabase for backend services:

- **Authentication**: Managed through Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Live updates for bounties and leaderboards
- **Storage**: Profile pictures and proof images

## Development

### IDE Setup

**Recommended**: [VS Code](https://code.visualstudio.com/) + [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

**Note**: Disable Vetur if you have it installed, as it conflicts with Volar.

### Browser DevTools

- **Chrome/Edge/Brave**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

Enable Custom Object Formatters in your browser's DevTools for better debugging.

### Code Quality

The project enforces code quality through:
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- TypeScript strict mode for type safety
- Pre-commit hooks (recommended to set up with Husky)

### Testing

**Unit Tests**: Run with Vitest
```bash
npm run test:unit
```

**E2E Tests**: Run with Nightwatch
```bash
npm run build  # Build first for CI
npm run test:e2e
```

Run specific tests:
```bash
npm run test:e2e -- tests/e2e/example.ts
npm run test:e2e -- --env chrome  # Chrome only
npm run test:e2e -- --debug        # Debug mode
```

## Skills Demonstrated

This project showcases proficiency in:

### Frontend Development
- **Vue.js 3** - Composition API, composables, reactive state management
- **TypeScript** - Advanced typing, interfaces, generics, type guards
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **State Management** - Pinia stores with TypeScript integration
- **Routing** - Vue Router with navigation guards and route protection

### Backend & Database
- **PostgreSQL** - Complex queries, joins, aggregations, and window functions
- **Supabase** - Authentication, real-time subscriptions, RLS policies
- **Database Design** - Normalized schemas, foreign keys, indexing strategies
- **API Integration** - RESTful APIs (Steam Web API), OAuth flows

### Software Engineering
- **Testing** - Unit tests (Vitest), E2E tests (Nightwatch)
- **Code Quality** - ESLint, Prettier, TypeScript strict mode
- **Version Control** - Git workflow, branching strategies
- **CI/CD** - Automated builds, pre-deployment checks
- **Security** - Authentication, authorization, input validation, XSS prevention

### Architecture & Design
- **Component Design** - Reusable, composable UI components
- **Separation of Concerns** - Clean architecture with distinct layers
- **Error Handling** - Graceful error states and user feedback
- **Performance** - Code splitting, lazy loading, optimization

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code passes ESLint and TypeScript checks
- All tests pass
- New features include appropriate tests
- Code follows existing style conventions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Arc Raiders community
- Powered by [Vue.js](https://vuejs.org/), [Supabase](https://supabase.com/), and [Vercel](https://vercel.com/)
- Icons from [Lucide](https://lucide.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

- Report bugs through the in-app bug reporting system
- Join the Arc Raiders community Discord
- Check the FAQ section in the application for common questions

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Discord bot integration
- [ ] Advanced statistics and analytics
- [ ] Clan/team features
- [ ] Seasonal events and tournaments
- [ ] API for third-party integrations

---

<div align="center">

## 👨‍💻 About the Developer

Built by **FDekinder** as a full-stack web application to demonstrate modern web development practices and solve real community needs.

### Connect

[![GitHub](https://img.shields.io/badge/GitHub-FDekinder-181717?logo=github)](https://github.com/FDekinder)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://www.linkedin.com/in/frederick-de-kinder/)
[![Portfolio](https://img.shields.io/badge/Portfolio-www.dont--shoot.com-FF6B6B?logo=google-chrome&logoColor=white)](https://www.dont-shoot.com)

**Made with ❤️ for the Arc Raiders community**

</div>
