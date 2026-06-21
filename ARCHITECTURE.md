System Architecture
Architecture Overview
The platform follows a modern web application architecture.
Components:
Frontend Client
Backend Services
AI Processing Layer
Database Layer
Storage Layer
Social Media Integrations

Component Diagram / Data Flow
●       User Interaction: The user interacts with the Frontend Client (Next.js & Tailwind CSS).
●       Client to Backend: The Frontend sends requests to the Backend APIs (FastAPI hosted on Render).
●       Database Operations: The Backend APIs read and write structured data to the Database Layer (Supabase PostgreSQL).
●       AI Trigger: The Backend triggers background workflows for the AI Processing Layer (OpenRouter & Trigger.dev) to generate content.
●       Social Publishing: The AI Processing Layer pushes the finalized content outward, publishing directly to Social Media (Instagram Graph API).

Technology Stack
Frontend
Technology:
●       Next.js
●       Tailwind CSS
●       shadcn/ui
Rationale:
●       Rapid development
●       Modern user experience
●       Large ecosystem support

Backend
Technology:
●       Supabase
●       Fast API
●       Edge Functions
●       Render
Rationale:
●       Minimal infrastructure management
●       Better Auth for authentication
●       Built-in database
●       Run long standing jobs

Authentication
Technology:
●       Better Auth
Rationale:
●       Greater flexibility and control over auth layer
●       Supports OAuth providers, session management, and password reset
●       Independent from Supabase, decoupled auth concerns

Database
Technology:
●       PostgreSQL (Supabase)
Rationale:
●       Reliable relational storage
●       Easy scalability
●       Supports structured business data

AI Layer
Technology:
●      OpenRouter
Purpose:
●       Business analysis
●       Content generation
●       Reply generation
●       Strategy recommendations

Vector Storage
Technology:
●       pgvector
Purpose:
●       Business memory
●       Website knowledge
●       FAQ retrieval

Storage
Technology:
●       Supabase Storage
Purpose:
●       Generated images
●       User uploads
●       Brand assets

Scheduling
Technology:
●       Trigger.dev
Purpose:
●       Content generation jobs
●       Publishing jobs
●       Notifications

State Management & Data Fetching
Technology:
●       Next.js Server Actions
●       React Context
Rationale:
●       Native to Next.js App Router paradigm
●       Minimizes client-side JavaScript

Animation & UI Libraries
Technology:
●       Framer Motion
●       Lucide React
Rationale:
●       Fluid micro-interactions and layout transitions
●       Consistent iconography for premium feel

Hosting & Deployment
Technology:
●       Vercel (Frontend)
●       Render (Backend APIs)
Rationale:
●       Optimized hosting for Next.js (Vercel)
●       Ideal for FastAPI microservices (Render)

Observability & Analytics
Technology:
●       Linear SDK (Feedback)
●       TBD (Analytics & Error Tracking)
Purpose:
●       Direct user feedback pipeline
●       Future integration for system monitoring and error logging

CI/CD Pipeline
Technology:
●       TBD
Rationale:
●       Automated testing and deployment strategy to be determined
