# Overview

Sage is an AI-powered learning platform designed to help users achieve any learning goal through personalized, adaptive learning paths. The application combines conversational AI guidance with structured curriculum generation, interactive assessments, and portfolio building. Users start by describing their learning objectives through an enhanced onboarding wizard, and the AI creates customized step-by-step learning paths with curated resources, practical projects, and ongoing support through an intelligent tutoring system.

**Key Innovation: Adaptive Difficulty System** - The platform monitors user chat interactions to dynamically analyze comprehension levels and automatically adjusts content difficulty, persona, and recommendations in real-time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side uses React with TypeScript in a modern single-page application structure. The UI is built with shadcn/ui components and Radix UI primitives, styled with Tailwind CSS for consistent design. The application uses Wouter for lightweight routing and TanStack Query for server state management and API interactions.

Key architectural decisions:
- **Component Library**: shadcn/ui provides pre-built, accessible components that can be customized
- **State Management**: React Context API handles global application state (user, current learning path)
- **Routing**: Wouter chosen over React Router for smaller bundle size and simpler API
- **Styling**: Tailwind CSS with CSS custom properties for theming support

The frontend follows a feature-based directory structure with shared UI components, organized around three main user flows: onboarding (landing), learning (dashboard and lessons), and portfolio (progress tracking).

## Backend Architecture

The server uses Express.js with TypeScript in ESM format, following a clean separation between routes, services, and data access layers. The application implements a RESTful API design with dedicated service modules for external integrations.

Core architectural patterns:
- **Storage Abstraction**: Interface-based storage layer allows for different database implementations
- **Service Layer**: Separate services handle business logic, particularly OpenAI integrations
- **Route Organization**: Centralized route registration with middleware for logging and error handling
- **Development Integration**: Vite middleware integration for seamless development experience

## Data Storage

The application uses Drizzle ORM with PostgreSQL for type-safe database operations. The schema supports a comprehensive learning management system with users, learning paths, modules, lessons, projects, achievements, and chat messages.

Database design highlights:
- **Hierarchical Structure**: Learning paths contain modules, which contain lessons
- **Progress Tracking**: Built-in progress fields and completion status at multiple levels
- **Flexible Content**: JSONB fields for rich lesson content and extensible data structures
- **Social Features**: Support for achievements, skills, and user portfolios

## Authentication and Authorization

The current architecture includes user management infrastructure with plans for session-based authentication. The database schema supports user profiles with points, streaks, and social features, though authentication middleware is not yet implemented.

## Adaptive Difficulty System

The platform features an advanced adaptive difficulty system that monitors user chat interactions to provide personalized learning experiences:

### Core Components
- **Difficulty Analysis Engine**: Uses OpenAI to analyze user messages for comprehension patterns
- **Learning Style Inference**: Automatically detects preferred learning styles (visual, hands-on, reading, interactive, step-by-step) from user behavior
- **Real-time Adaptation**: Adjusts AI persona and content recommendations based on user understanding and learning preferences
- **Learning Analytics**: Tracks user progress, confidence levels, and inferred learning styles across lessons and modules
- **Predictive Recommendations**: Generates adaptive content suggestions for optimal learning pace

### Analysis Triggers
- Performs difficulty analysis every 5 user messages (minimum 3 messages)
- Analyzes question complexity, concept grasp, engagement level, and help-seeking patterns
- Infers learning style preferences from conversation patterns and content requests
- Classifies users into four difficulty levels: struggling, comfortable, advanced, mastery

### Adaptive Features
- **Persona Adjustment**: AI tutor becomes more supportive for struggling learners, more challenging for advanced users
- **Content Modification**: Suggests simplified explanations or advanced topics based on comprehension
- **Learning Style Adaptation**: Emphasizes visual examples, hands-on projects, or detailed explanations based on inferred preferences
- **Interaction Optimization**: Provides personalized chat suggestions and learning recommendations
- **Dynamic Onboarding**: Removes the need for users to self-assess learning styles by inferring them through behavior

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **OpenAI API**: GPT-4o integration for content generation, learning path creation, conversational AI tutoring, and adaptive difficulty analysis
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **shadcn/ui**: Component library built on Radix UI primitives
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server with React plugin