# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

### Environment Setup
The project requires Supabase environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL with real-time features)
- **Styling**: Tailwind CSS
- **State Management**: React hooks with localStorage for client-side persistence
- **Authentication**: Supabase Auth with PKCE flow
- **Icons**: Lucide React, React Icons

### Database Schema
The application uses the following main tables:
- `bookmarks` - Main bookmark data with user association
- `tags` - User-specific tags
- `bookmarks_tags` - Many-to-many relationship between bookmarks and tags
- `user_settings` - User preferences (display mode, column count)
- `tag_rules` - Automated tagging rules based on URL/title patterns

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (bookmark import)
│   ├── auth/           # Authentication page
│   └── page.tsx        # Main application page
├── components/         # React components
├── lib/               # Shared utilities and clients
│   └── supabaseClient.ts # Supabase configuration
├── types/             # TypeScript type definitions
└── utils/             # Utility functions and exports
```

### Key Architectural Patterns

#### Data Flow Architecture
- **Client State**: React hooks manage UI state and user interactions
- **Server State**: Supabase handles data persistence with real-time subscriptions
- **Type Conversion**: Dedicated functions convert between database schema (`Bookmark`) and UI representation (`BookmarkUI`)

#### Authentication Flow
- Redirects unauthenticated users to `/auth`
- Uses Supabase Auth with real-time session monitoring
- Implements Row Level Security (RLS) for data isolation

#### Component Architecture
- **Page Components**: Handle data fetching and high-level state management
- **Feature Components**: Manage specific functionality (BookmarkForm, TagManager)
- **UI Components**: Reusable styled components (Button, Input)

### Important Implementation Details

#### Type System
- Database types (`Bookmark`, `Tag`) mirror Supabase schema
- UI types (`BookmarkUI`) provide camelCase properties for React components
- Helper functions `convertToUI()` and `convertToDB()` handle transformations

#### Tag Management
- Tags are user-scoped and created dynamically
- Supports both manual tagging and automated rule-based tagging
- Many-to-many relationship implemented via `bookmarks_tags` junction table

#### User Settings
- Persisted in Supabase `user_settings` table
- Controls display mode (grid/list) and column count
- Automatically synced across sessions

## Development Guidelines

### Database Operations
- Always include `user_id` filtering in queries for data isolation
- Use Supabase's real-time features for live updates
- Handle both insert and update scenarios in form submissions

### Error Handling
- Wrap Supabase operations in try-catch blocks
- Check for active sessions before database operations
- Provide user-friendly error messages in Japanese

### State Management
- Use `useState` for local component state
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Use `useMemo` for expensive computations (filtering, sorting)

### Performance Considerations
- Implement proper loading states during data fetching
- Use optimistic updates where appropriate
- Minimize database queries by batching operations