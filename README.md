# Marketme

AI marketing manager SaaS for small businesses. Built with Next.js, TypeScript, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API routes live under `app/api/` (e.g. `/api/health`).

### Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |

## Project structure

```
app/
├── api/          # Route handlers (App Router)
├── layout.tsx    # Root layout
├── page.tsx      # Home page
└── globals.css
```

## Collaboration

We work in small, reviewable increments tied to Linear issues.

1. **Start from the issue** — Read the assigned Linear ticket before writing code.
2. **Explore first** — Inspect the existing codebase and follow established patterns.
3. **Plan briefly** — Outline a small implementation plan before making changes.
4. **Smallest viable change** — Ship the minimum that satisfies the issue. Avoid scope creep.
5. **One PR per issue** — Keep pull requests focused and easy to review.
6. **PR checklist** — Include a summary, testing notes, UI screenshots when relevant, and known limitations.

## Best practices

**TypeScript** — Use strict typing throughout. Avoid `any` unless there is a documented reason.

**Reuse, don't duplicate** — Extend existing utilities, components, and clients instead of creating parallel versions.

**AI outputs** — Validate all AI-generated content with schemas before persisting or returning it to users.

**Secrets** — Never expose API keys, service-role keys, or other credentials to the client. Keep sensitive config server-side only.

**Quality gate** — Run lint and typecheck (and tests, when present) before opening a PR.

**Next.js** — This project uses Next.js 16 with the App Router. Check the local docs in `node_modules/next/dist/docs/` when working with framework APIs.

## Agent & contributor notes

Additional workflow rules for AI agents and contributors live in `.agents/rules/workflow.md`.
