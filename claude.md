@AGENTS.md

# Project Working Document — Armaan Legal Website

> Claude's living roadmap and memory for this project.

---

## Confirmed Decisions

| Topic | Decision |
|---|---|
| Color palette | Dark black + gold from screenshots — refined/professional usage |
| Logo | `<img src="/logo.svg" />` — file provided by user later |
| Hero image | Stock legal/port image (placeholder) |
| Contact form | Wired to database from day one |
| Team section | Skip for now |
| Animations | Yes — subtle scroll-triggered animations |
| Header | Standard (not sticky), beautiful UI/UX |
| Dark/light mode | Toggle included |
| Database | MySQL on host — no schema designed yet |
| ORM | Drizzle ORM (TypeScript-first, lightweight) |
| Persian/Arabic font | Vazirmatn (Google Fonts) |
| Blog content storage | Rich HTML via a powerful WYSIWYG editor |
| Blog images | Uploaded to server (NOT base64 embedded) — requires file upload API |
| Rich text editor | **Lexical** — handles inline Persian + English BiDi without collapse |

---

## Environment Notes

- **Next.js 16.2.7** — `middleware.ts` is deprecated; the new file is `proxy.ts` (same API).
- **React 19.2.4**, **Tailwind v4**, **shadcn/ui** already installed.
- App Router only. No Pages Router.

---

## Roadmap

### Phase 1 — Package Installation

| Package | Purpose |
|---|---|
| `mysql2` | MySQL driver |
| `drizzle-orm` | Type-safe ORM |
| `drizzle-kit` | Migration CLI |
| `next-intl` | i18n — App Router + URL prefix support |
| `react-hook-form` | Forms |
| `zod` | Schema validation |
| `@hookform/resolvers` | Zod ↔ react-hook-form bridge |
| `next-themes` | Dark/light mode toggle |
| `lexical` | Core Lexical editor engine |
| `@lexical/react` | React bindings for Lexical |
| `@lexical/rich-text` | Headings, bold, italic, etc. |
| `@lexical/list` | Ordered / unordered lists |
| `@lexical/link` | Hyperlink support |
| `@lexical/table` | Table support |
| `@lexical/code` | Code block support |
| `@lexical/html` | Serialize editor state → HTML for storage |
| `sharp` | Server-side image processing/optimization |

> **Why Lexical for the editor**: Lexical is built by Meta (Facebook) specifically for multilingual editing — it is what powers Facebook's post composer for Arabic/Hebrew mixed with English. It handles Unicode Bidirectional text natively without cursor jumping or content collapse. Images are uploaded via a custom plugin that calls `/api/upload`, which returns a URL stored in the HTML content — never base64.

---

### Phase 2 — i18n & Routing (proxy.ts)

- Locales: `fa` (default — no URL prefix), `en` (/en), `ar` (/ar)
- `proxy.ts` handles: `Accept-Language` detection → redirect to correct locale prefix
- Message files: `messages/fa.json`, `messages/en.json`, `messages/ar.json`
- `i18n/config.ts` + `i18n/request.ts` for next-intl integration

---

### Phase 3 — Database Schema (Drizzle + MySQL)

**Tables:**

- `users` — id, email, password_hash, role (`admin` | `editor`), created_at
- `posts` — id, slug, category (`blog` | `article` | `news` | `tutorial`), author_id, published_at, created_at, updated_at
- `post_translations` — id, post_id, locale (`fa` | `en` | `ar`), title, excerpt, content (LONGTEXT — rich HTML), meta_title, meta_description
- `post_images` — id, post_id, filename, path, size, created_at ← tracks uploaded images per post
- `contacts` — id, name, email, phone, message, created_at, read (boolean)

**File uploads:**
- Uploaded images stored in `public/uploads/` (or a dedicated `/uploads` volume)
- API route: `POST /api/upload` → saves file, returns URL
- Tiptap image extension calls this API when admin inserts an image

**.env:**
```
DATABASE_URL=mysql://user:pass@host:3306/dbname
UPLOAD_DIR=./public/uploads
```

---

### Phase 4 — App Directory Structure

```
app/
├── [locale]/                    ← /en and /ar prefixed routes
│   ├── layout.tsx               ← sets lang + dir per locale
│   ├── page.tsx                 ← homepage
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── blog/
│   │   ├── page.tsx             ← blog listing
│   │   └── [slug]/page.tsx      ← single post
│   └── admin/
│       ├── layout.tsx           ← admin shell (auth guard later)
│       ├── page.tsx             ← dashboard stub
│       └── posts/
│           ├── page.tsx         ← post list
│           ├── new/page.tsx     ← create post (Lexical editor)
│           └── [id]/page.tsx    ← edit post (Lexical editor)
├── layout.tsx                   ← root layout (ThemeProvider)
├── page.tsx                     ← Persian homepage (no prefix)
├── about/page.tsx
├── contact/page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
api/
├── upload/route.ts              ← image upload handler
├── contact/route.ts             ← contact form submission
└── posts/route.ts               ← post CRUD (used by admin)

proxy.ts                         ← language detection + locale redirect
lib/
├── db.ts                        ← Drizzle + mysql2 connection
├── schema.ts                    ← all table definitions
└── utils.ts                     ← (existing)
messages/
├── fa.json
├── en.json
└── ar.json
i18n/
├── config.ts
└── request.ts
public/
└── uploads/                     ← uploaded blog images land here
```

---

### Phase 5 — RTL/LTR Layout System

- `[locale]/layout.tsx` sets `<html lang={locale} dir={locale === 'en' ? 'ltr' : 'rtl'}>`
- Vazirmatn loaded via `next/font/google` for `fa` and `ar`; system sans-serif for `en`
- Tailwind v4 RTL utility classes used throughout components

---

### Phase 6 — Law Firm Homepage (9 Sections)

Color tokens:
- Background: `#0a0a0a` (dark) / `#f5f3ee` (light)
- Gold accent: `#b8952a`
- Card background: `#1a2744`
- Text: `#ffffff` (dark) / `#1a1a1a` (light)

Sections:
1. **Header/Navbar** — logo (`/logo.svg`), nav links, language switcher dropdown, dark/light toggle, CTA button
2. **Hero** — stock legal/port image, headline, subheadline, gold CTA button, subtle overlay
3. **Firm Overview** — trust stats (years, clients, cases), short intro paragraph
4. **Practice Areas** — 4-card grid with icons (from screenshots: customs, shipping, legal advisory, trade management)
5. **Smart Trade Solutions** — alternating image + text blocks (from screenshots)
6. **Blog Preview** — 3 latest post cards (date, title, excerpt, "ادامه مطلب" link)
7. **Testimonials** — 2–3 quote cards (placeholder text)
8. **Contact Section** — form (name, email, phone, message) + contact info sidebar
9. **Footer** — logo, nav links, social icons, copyright

Animations:
- Scroll-triggered fade-in + slide-up (via CSS `@keyframes` + Intersection Observer, or a small lib like `framer-motion`)
- Hover effects on cards and buttons
- Smooth page transitions

---

### Phase 7 — SEO & Metadata

- `generateMetadata()` per page, per locale
- Correct `<html lang>` and `<html dir>` per locale
- Open Graph + Twitter card tags
- Canonical URLs with locale prefix

---

### Phase 8 — Admin Panel (Stub → Editor)

- `/admin` route with sidebar layout
- Post list page
- Create/Edit post page with full **Lexical** WYSIWYG editor:
  - Headings (H1–H4), bold, italic, underline, strikethrough
  - Ordered/unordered lists
  - Tables
  - Image upload — toolbar button + drag & drop → calls `/api/upload` → stored as URL, never base64
  - Code blocks
  - Link insertion
  - RTL/LTR toggle per block (Persian paragraph can have inline English without collapse)
  - Inline BiDi: Unicode Bidirectional Algorithm handles `متن فارسی example متن` natively
- Language tabs: write Persian / English / Arabic content for each post

---

## Open Questions (no blockers — decisions made above)

- Authentication for admin panel: **not in scope yet** (stub only for now)
- Email notification on contact form: deferred (store in DB first)

---

## Status: PHASE 1–8 COMPLETE ✅ — build passing, zero TS errors

### What to do next
1. Copy `.env.example` → `.env.local` and fill in your MySQL credentials
2. Run `npm run db:push` to push the schema to your MySQL database
3. Run `npm run dev` to start the development server
4. Add `/public/hero-bg.jpg`, `/public/logo.svg`, and blog images
5. Proceed to: content for About/Services pages, blog module with dynamic DB queries, admin authentication
