# Deploying the Great Notch Inn rebuild

**Status: NOT DEPLOYED.** Nothing in this repo has been uploaded. Steps A–E were local only. Deploying (plan step F)
needs John's go-ahead first.

## What's in the site
Upload these to the web root (`public_html` on GoDaddy):

| Path | Notes |
|---|---|
| `index.html` | The whole one-page site |
| `css/style.css`, `js/app.js` | The only CSS and JS files |
| `images/` | Masters (`*.jpg`) + generated `*.webp` / `*.avif` sizes. All of it is needed |
| `favicon.ico` | Same file as the live site |
| `robots.txt`, `sitemap.xml` | Replace the live ones (check the TODO-JOHN host first) |
| `.htaccess` | **Merge. Don't overwrite** (see below) |

Don't upload: `README.md`, `DEPLOY.md`, `QA.md`, `tools/`, `scratch/`, `.git/`, `.gitignore`.

## Before uploading
1. **Settle the TODO-JOHN items** (`rg -n TODO-JOHN`). At least canonical host, hours, and the Directions/Maps link.
   The visible "[... coming soon]" placeholders will show on the live page until they're filled in.
2. **Back up the live site.** A full mirror from 2026-09-29 is already at
   `clients/_archive/greatnotch_2026-09-29/live_mirror/`. Also download the server's current `.htaccess`, `index.html`,
   `robots.txt` and `sitemap.xml` straight from the host by FTP or the File Manager (the mirror can't see `.htaccess`).
3. **Keep the old files.** The live server also has press PDFs, `aboutus2.html`, `aboutus3.html`, and the
   `photos/`, `merch/` and `css/style1.css` folders. Don't delete them in this deploy. Decide separately
   (TODO-JOHN in `.htaccess` / `sitemap.xml`) whether to keep, redirect or remove them.

## .htaccess
The live server almost certainly already has an `.htaccess`. It does the http → https redirect, and the host's bot check
may depend on it. Paste our blocks (compression, caching, security headers) **below** the existing rules. Leave the
commented-out canonical and old-URL redirects off until John decides. After uploading, check:
- `curl -sI https://thegreatnotchinn.com/` returns 200 with `content-encoding: gzip` (fetch with `Accept-Encoding: gzip`)
- `curl -sI https://thegreatnotchinn.com/images/IMG_0742-800.avif` returns 200 with a long `cache-control` / `expires`
- http:// and greatnotchinn.com still redirect as they do now

If anything returns 500, put the original `.htaccess` back first. That's the usual cause.

## Rollback
1. Re-upload the backed-up `index.html`, `.htaccess`, `robots.txt` and `sitemap.xml` (or copy from
   `_archive/greatnotch_2026-09-29/live_mirror/thegreatnotchinn.com/`, which has the live pages, `css/style1.css`
   and images).
2. The new `css/style.css`, `js/app.js` and new image files don't conflict with the old site's file names. The old site uses
   `css/style1.css`. They can stay or be removed.
3. Hard-refresh and test on a phone.

## After uploading
- Run the `QA.md` checklist against the live URL.
- Re-run Lighthouse (mobile + desktop) on the live URL. The local numbers in `QA.md` are the target.
- Submit `sitemap.xml` in Google Search Console once the canonical host is decided.
