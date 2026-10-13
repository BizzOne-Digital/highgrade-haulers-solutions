# Highgrade Haulers Solutions — Website & Admin

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · MongoDB + Mongoose · Lucide icons.

- **Public site:** `/`, `/services`, `/pricing`, `/booking`, `/contact` (separate routes and page components).
- **Admin panel:** `/admin/login`, `/admin`, `/admin/pages`, `/admin/services`, `/admin/pricing`, `/admin/bookings`, `/admin/leads`, `/admin/gallery`, `/admin/settings`.
- All content, settings, submissions, and uploaded images live in MongoDB. Nothing is written to disk, so the app runs on read-only serverless filesystems and uploads survive redeployments.

---

## 1. Local setup

Requirements: Node.js 20.9+ and a MongoDB database (MongoDB Atlas free tier is fine).

```bash
npm install
cp .env.example .env.local      # then fill in MONGODB_URI
npm run seed                    # loads the business content (safe to re-run)
npm run create-admin            # see section 2
npm run dev                     # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Server-side only. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for SEO, sitemap, Open Graph, and the origin check. Set it to the Vercel URL until a real domain is connected. |
| `ALLOWED_ORIGINS` | No | Extra comma-separated origins allowed to call admin APIs (for example a preview URL). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Only for `create-admin` | Read by the CLI script only, never by the running app. |

No session secret is needed: sessions are random 256-bit tokens; only their SHA-256 hash is stored in MongoDB.

## 2. Creating the first admin (safe setup)

There are no default or hard-coded credentials. Create the admin from your own machine against the production database:

```bash
# PowerShell
$env:ADMIN_EMAIL="owner@example.com"; $env:ADMIN_PASSWORD="Choose-A-Strong-Passw0rd"; npm run create-admin
# bash
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='Choose-A-Strong-Passw0rd' npm run create-admin
```

- The password must be 12+ characters with upper-case, lower-case, and a number. It is hashed with bcrypt (cost 12).
- Running it again for an existing email changes nothing. To reset a password, add `--reset` (this also signs out that admin's sessions).
- Do not store `ADMIN_PASSWORD` in Vercel or in committed files.

## 3. Database

Collections (Mongoose models in `src/lib/models/index.ts`): `AdminUser`, `AdminSession`, `SiteSettings`, `PageContent`, `Service`, `PricingSettings`, `Booking`, `ContactLead`, `GalleryItem`, `StoredUpload`, plus `RateLimit`, `UploadSession`, and `UploadChunk` (short-lived, TTL-indexed).

- Every model uses timestamps and relevant indexes (`StoredUpload` has a unique `{folder, filename}` index; bookings/leads are indexed by status and date; sessions, rate limits, and chunk staging expire automatically via TTL indexes).
- The connection is cached on `globalThis`, so each serverless instance reuses one pool.
- **Seeding:** `npm run seed` uses `$setOnInsert` only. It creates missing documents and never overwrites anything edited in the admin panel. Nothing is seeded on app startup or deploy.
- If the database is unreachable, public pages fall back to the bundled default content instead of erroring. Forms never report success unless the record was saved.

## 4. Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel (framework preset: Next.js).
2. Add `MONGODB_URI` and `NEXT_PUBLIC_SITE_URL` in Project Settings → Environment Variables.
3. In MongoDB Atlas → Network Access, allow Vercel to connect (Atlas recommends `0.0.0.0/0` with a strong database user for Vercel, or use Vercel's Atlas integration).
4. Deploy. Then run `npm run seed` and `npm run create-admin` locally with `MONGODB_URI` pointing at the production database.
5. When a domain is connected, update `NEXT_PUBLIC_SITE_URL` and redeploy.

Other Node.js hosts (Netlify, Render, Railway, a VPS) work the same way: `npm run build && npm start`.

Public pages are statically cached and revalidated every 5 minutes; every admin save calls `revalidatePath("/", "layout")`, so changes appear immediately.

## 5. Image uploads and limits

- Admin images are uploaded through `LocalImageField` → `POST /api/upload` (multipart `file` + `folder`) and stored as binary in the `StoredUpload` collection.
- Served publicly from `GET /api/uploads/{folder}/{filename}` with the stored MIME type, exact `Content-Length`, `Cache-Control: public, max-age=31536000, immutable`, and `X-Content-Type-Options: nosniff`.
- Server validation: admin session, folder whitelist (`products | gallery | pages | misc`), MIME whitelist (JPEG, PNG, WebP, GIF), **8 MB maximum**, and magic-byte signature check that must match the declared type. Filenames are generated server-side as `${Date.now()}-${16 hex}.${ext}` using `crypto.randomBytes`.
- Content documents store only the URL string.

### Request-size limit on Vercel

Vercel Functions reject request bodies larger than **4.5 MB** before the application code runs, so an 8 MB multipart upload cannot reach a function directly. The app handles this automatically:

| File size | Path used |
| --- | --- |
| up to 4 MB | Direct `POST /api/upload` |
| 4 MB – 8 MB | Chunked upload: `POST /api/upload/chunked` → `PUT /api/upload/chunked/{id}?index=N` (3 MB parts) → `POST /api/upload/chunked/{id}` |
| over 8 MB | Rejected in the browser and on the server (HTTP 413) |

Chunk parts are staged in MongoDB (never on disk), assembled, and then validated exactly like a direct upload. Incomplete uploads are deleted on failure and expire automatically after one hour via TTL indexes. Each request stays well below 4.5 MB.

**What was tested:** both paths were verified locally against MongoDB (see section 7). They have not yet been tested on the live Vercel deployment because none exists yet. After the first deploy, upload a ~7 MB JPEG in **Admin → Gallery** to confirm the chunked path on the real host.

### Replacing and deleting images

- Replace/remove in the editor only changes the form. When the document is saved, the server compares old and new image URLs and deletes the old upload **only if no other saved content still references it**.
- Uploads that were replaced or removed before saving (or left behind when you cancel a form) are discarded right away, again only if nothing references them.
- **Admin → Gallery & Uploads → Stored uploads** lists every file with an "In use" flag and can clean up unused uploads older than 24 hours.
- Remote Unsplash URLs are never deleted. Legacy `/uploads/...` paths and missing/broken images show a placeholder (`public/images/placeholder.svg`) without retry loops.

## 6. Security summary

- HttpOnly session cookie (`Secure` in production, `SameSite=Lax`), 12-hour expiry, validated against MongoDB on every admin page and API call. `src/proxy.ts` only does a fast redirect; it is not the security boundary.
- Every admin mutation, upload, and delete endpoint requires a valid session **and** a same-origin `Origin`/`Referer` (CSRF protection).
- Rate limits (MongoDB-backed, shared across instances): login 10 per IP and 8 per email per 15 minutes; booking and contact forms 5 per IP per 10 minutes.
- Public forms use a honeypot field and a minimum fill time. All input is validated server-side with zod.
- Public APIs only accept submissions; they never return stored data.
- No email service is configured. Submissions are saved and shown in the admin panel; the site never claims that an email was sent.

## 7. Verification

```bash
npm run typecheck
npm run lint
npm run build
```

Checks performed during development (local, MongoDB 8 in-memory server):

- All five public routes and admin routes render; navigation links open dedicated routes.
- Unauthenticated requests to admin pages redirect to `/admin/login`; admin APIs return 401; cross-origin mutations return 403.
- Admin edits (page text, pricing, settings) appear on the public pages after saving.
- Booking and contact submissions persist and appear in the admin panel.
- Uploads: direct (small) and chunked (~7 MB) uploads succeed and are served with correct bytes and headers; invalid folders, wrong file signatures, and >8 MB files are rejected; a shared image is not deleted while referenced; legacy `/uploads/...` URLs show the placeholder.

## 8. Content notes

- Initial photos are real Unsplash images (served from `images.unsplash.com`) chosen to match each service. They are stock photos and do not show the client's own equipment. Replace them with real job photos from **Admin → Page Content** and **Admin → Services**.
- Not included on purpose: business address, service area, reviews or ratings, licenses or insurance claims, overage rates, and online payments. Add a service area or Facebook URL in **Admin → Settings** when available; both stay hidden until filled in.


## Bundled website images

The public page heroes and service illustrations use 14 optimized WebP assets in public/images/highgrade. These were created with the built-in image generation tool and are illustrative imagery, not actual company job photographs. Their full prompts are recorded in scripts/image-generation-prompts.json. Original seeded Unsplash URLs are resolved to these bundled images in public and admin content readers, including dedicated page heroes, without changing unrelated saved content. Custom images and MongoDB admin uploads continue to use their own URLs. No database reseed is required.
