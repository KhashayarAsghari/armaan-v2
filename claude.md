@AGENTS.md

# Project Working Document — Armaan Legal Website

> Claude's living roadmap and memory for this project.

---

## Confirmed Decisions

| Topic | Decision |
|---|---|
| Color palette | Dark black + gold from screenshots — refined/professional usage |
| Logo | `/home-images/logo.png` |
| Hero image | `/home-images/hero.png` |
| Contact form | Wired to database from day one |
| Team section | Skip for now |
| Animations | Yes — subtle scroll-triggered animations |
| Header | Sticky on mobile, floating pill nav on desktop |
| Dark/light mode | Toggle included |
| Database | MySQL on host |
| ORM | Drizzle ORM (TypeScript-first, lightweight) |
| Persian/Arabic font | Vazirmatn (Google Fonts) |
| Content storage | Rich HTML via Lexical WYSIWYG editor |
| Images in content | Uploaded to server (POST /api/upload) — never base64 |
| Rich text editor | **Lexical** — handles Persian + English BiDi without collapse |
| Admin auth | Custom JWT → httpOnly + Secure cookie; single fixed user from .env |
| Post status | Per-locale: each translation has its own `draft \| published` status |
| Cover image | Per-locale: each translation has its own cover/thumbnail image |
| Content types | `blog \| news \| tutorial` — all share the same `posts` schema |
| Slug | Shared across locales (one slug per post, on `posts` table) |
| Tutorials extra fields | None — same structure as blog |

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

- `posts` — id, slug (UNIQUE), category (`blog | news | tutorial`), created_at, updated_at
- `post_translations` — id, post_id, locale (`fa | en | ar`), title, excerpt, content (LONGTEXT — rich HTML), cover_image (VARCHAR nullable), status (`draft | published`), published_at (nullable), meta_title, meta_description
- `post_images` — id, post_id, filename, path, size, created_at ← tracks uploaded images per post
- `contacts` — id, name, email, phone, message, created_at, read (boolean default false)

> No `users` table — admin auth uses a single fixed user from .env (see Phase 9).

**Unique constraint:** `(post_id, locale)` on `post_translations` — one row per language per post.

**File uploads:**
- Uploaded images stored in `public/uploads/`
- API route: `POST /api/upload` → saves file, returns `{ url: "/uploads/filename.ext" }`
- Lexical image plugin calls this API when admin inserts an image

**.env:**
```
DATABASE_URL=mysql://user:pass@host:3306/dbname
UPLOAD_DIR=./public/uploads
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=bcrypt_hash_here
JWT_SECRET=long_random_secret
```

---

### Phase 4 — App Directory Structure

```
app/
├── [locale]/                      ← /en and /ar prefixed routes
│   ├── layout.tsx                 ← sets lang + dir per locale
│   ├── page.tsx                   ← homepage
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── blog/
│   │   ├── page.tsx               ← blog listing (published only)
│   │   └── [slug]/page.tsx        ← single post
│   ├── news/
│   │   ├── page.tsx               ← news listing
│   │   └── [slug]/page.tsx        ← single news item
│   └── tutorials/
│       ├── page.tsx               ← tutorials listing
│       └── [slug]/page.tsx        ← single tutorial
├── layout.tsx                     ← root layout (ThemeProvider)
├── page.tsx                       ← Persian homepage (no prefix)
├── about/page.tsx
├── contact/page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── news/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── tutorials/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── admin/
│   ├── login/page.tsx             ← login form (public)
│   ├── layout.tsx                 ← auth guard + sidebar shell
│   ├── page.tsx                   ← dashboard (stats + recents)
│   ├── contacts/
│   │   └── page.tsx               ← contact list, mark read, delete
│   ├── blog/
│   │   ├── page.tsx               ← post list with status badges
│   │   ├── new/page.tsx           ← create (locale tabs + editor)
│   │   └── [id]/page.tsx          ← edit (locale tabs + editor)
│   ├── news/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── tutorials/
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [id]/page.tsx
└── api/
    ├── auth/
    │   ├── login/route.ts         ← POST: verify creds → set JWT cookie
    │   └── logout/route.ts        ← POST: clear cookie
    ├── upload/route.ts            ← POST: save image, return URL
    ├── contact/route.ts           ← POST: save contact form
    └── posts/
        ├── route.ts               ← GET ?category=&locale= / POST
        └── [id]/
            └── route.ts           ← GET / PUT / DELETE

proxy.ts                           ← language detection + locale redirect
lib/
├── db.ts                          ← Drizzle + mysql2 connection
├── schema.ts                      ← all table definitions
├── auth.ts                        ← JWT sign/verify, cookie helpers
└── utils.ts
messages/
├── fa.json
├── en.json
└── ar.json
i18n/
├── config.ts
└── request.ts
public/
├── home-images/                   ← hero.png, logo.png, stack1.png, stack2.png
└── uploads/                       ← runtime-uploaded content images
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

### Phase 8 — Public Content Pages (Blog / News / Tutorials)

- Listing pages: fetch published translations for current locale; show cover image, title, excerpt, date, "ادامه مطلب"
- Detail pages: fetch single post by slug + locale; render `content` HTML safely; set `<html dir>` per locale
- If no translation exists for the current locale → show 404 (do NOT fall back to another locale)
- `generateMetadata()` per page uses `meta_title` / `meta_description` from `post_translations`
- Open Graph cover image from `cover_image` field

---

### Phase 9 — Admin Panel (Full Implementation)

#### 9-A Auth

- `lib/auth.ts` — `signJwt(payload)`, `verifyJwt(token)`, `getSession(request)` using `jose` (Edge-compatible)
- Login flow: `POST /api/auth/login` → compare email+password against .env values (bcrypt) → sign JWT (24h) → set `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax; Path=/`
- Logout: `POST /api/auth/logout` → clear cookie
- `app/admin/layout.tsx` reads cookie → calls `getSession()` → redirects to `/admin/login` if invalid
- `app/admin/login/page.tsx` — clean form, gold CTA button, error state

#### 9-B Admin Sidebar Layout

- Persistent sidebar (collapsible on mobile) with sections:
  - Dashboard
  - درخواست‌های مشاوره (contacts)
  - بلاگ
  - اخبار
  - آموزش‌ها
- Active route highlighted, section badges show unread count (contacts) or total count
- Top bar: site name + logout button
- Dark theme always (independent of site theme)

#### 9-C Content List Pages (Blog / News / Tutorials)

Each list page:
- Table: cover thumbnail (small), title (fa fallback), category badge, per-locale status chips (fa/en/ar: published=green, draft=gray, missing=empty), created_at, actions (edit / delete)
- "افزودن جدید" button → `/admin/[section]/new`
- Delete: confirm dialog → `DELETE /api/posts/[id]` (deletes post + all translations + images)
- Pagination (20 per page)

#### 9-D Create / Edit Form

**Locale tabs** — three tabs: فارسی | English | العربية

Each tab independently contains:
- Cover image upload (drag & drop or click; preview shown; calls `POST /api/upload`)
- Title (text input)
- Excerpt (textarea, ~160 chars)
- **Lexical WYSIWYG editor** (see 9-E)
- Meta title + meta description (SEO accordion)
- Status toggle: Draft / Published (+ published_at auto-set on first publish)

**Shared fields** (above tabs):
- Slug (auto-generated from fa title on create; editable; unique validation via API)
- Category (blog / news / tutorial) — pre-set based on which section opened from

**Save behavior**: one `POST /api/posts` or `PUT /api/posts/[id]` call sends all locale data in a single payload; server upserts `post_translations` rows.

#### 9-E Lexical Editor (per locale tab)

Editor `dir` attribute: `rtl` for `fa`/`ar`, `ltr` for `en`

Toolbar buttons:
| Group | Buttons |
|---|---|
| Format | H1 H2 H3 H4 \| Normal |
| Inline | Bold Italic Underline Strikethrough |
| Lists | Unordered Ordered |
| Insert | Link \| Image \| Table \| Code block |
| Direction | RTL / LTR per block |

Image insert flow:
1. Click toolbar image button (or drag & drop file into editor)
2. File picker opens → user selects image
3. `POST /api/upload` (multipart) → server saves to `public/uploads/` → returns `{ url }`
4. Lexical `ImageNode` inserted with that URL
5. Server also saves a row in `post_images` so orphan cleanup is possible later

HTML serialization: `@lexical/html` `$generateHtmlFromNodes()` → stored in `post_translations.content`

#### 9-F Contacts Page

- Table: name, email, phone, message (truncated), date, read/unread badge
- Click row → expand message, mark as read (`PATCH /api/posts` — or separate `/api/contacts/[id]`)
- Delete contact
- Unread count shown in sidebar badge

#### 9-G API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Verify creds, set JWT cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/posts?category=blog&locale=fa&status=published` | List posts (public) |
| GET | `/api/posts?category=blog` | List posts (admin, all statuses) |
| POST | `/api/posts` | Create post + translations |
| GET | `/api/posts/[id]` | Get single post with all translations |
| PUT | `/api/posts/[id]` | Update post + upsert translations |
| DELETE | `/api/posts/[id]` | Delete post + cascade |
| POST | `/api/upload` | Save uploaded image → return URL |
| POST | `/api/contact` | Save contact form submission |
| GET | `/api/contacts` | List contacts (admin only) |
| PATCH | `/api/contacts/[id]` | Mark read / update |
| DELETE | `/api/contacts/[id]` | Delete contact |

All `/api/posts` write routes and all `/api/contacts` routes require valid JWT cookie.

---

### Phase 10 — New Package Requirements for Admin

| Package | Purpose |
|---|---|
| `jose` | Edge-compatible JWT sign/verify (replaces `jsonwebtoken`) |
| `bcryptjs` | Password hashing for admin login |
| `@types/bcryptjs` | Types |

---

## Open Questions

- Email notification on contact form: deferred (store in DB first, email later)

---

## Status

- **PHASE 1–8 (homepage + public pages)**: ✅ COMPLETE — build passing, zero TS errors
- **PHASE 9 (admin panel)**: 🔲 NOT STARTED — roadmap finalized, ready to implement

### What to do next (Phase 9 start)
1. `npm install jose bcryptjs @types/bcryptjs`
2. Update `lib/schema.ts` — add `status`, `cover_image`, `published_at` to `post_translations`; remove `users` table; update `category` enum to `blog | news | tutorial`
3. Run `npm run db:push`
4. Build `lib/auth.ts` — JWT helpers
5. Build `/api/auth/login` and `/api/auth/logout`
6. Build `app/admin/login/page.tsx`
7. Build `app/admin/layout.tsx` with auth guard + sidebar
8. Build content list + create/edit pages for blog, news, tutorials
9. Wire Lexical editor with image upload plugin
10. Build contacts page
11. Build public-facing `/[locale]/news` and `/[locale]/tutorials` routes
