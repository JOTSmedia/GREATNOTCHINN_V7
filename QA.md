# Great Notch Inn v7 — verification report

Checked October 26, 2026. This is a saved local version; the public website has not been changed.

## Completed changes

- Existing dark red roadhouse design and real Inn photographs preserved; root-relative image paths repaired for folder hosting.
- Public page and social titles have no version number.
- Loading screen runs about four seconds plus a short completion hold, with a horizontal progress bar, uppercase copy, skip control, and independent recovery deadline.
- Logo uses the existing Inn artwork, edited with the built-in image tool to remove its fabric background. The delivered PNG is RGBA, 1321 × 1191, with alpha values from 0 to 255. Original artwork is preserved in images/photos/37-1600.webp.
- All-day calendar entries are removed from upcoming, past, cached, modal, and on-page monthly displays. The unfiltered Google Calendar iframe was replaced by a month view of timed shows from the same live source.
- Hours & Info filled: Tuesday–Sunday 5 PM–2 AM; Monday closed; live music Tuesday–Sunday; bar pies; cash only with ATM; 21+. These facts were marked confirmed by John in v4/preview_grokme/index.html. Sunday show times vary and the live calendar is authoritative for each performance.
- Added the requested Liquid Death video, bringing the section to eight working players. All players have direct YouTube links.
- Section subtitles display in ALL CAPS. Seventeen reading paragraphs are justified, with automatic hyphenation and natural final lines.
- Phones use 11 native collapsible sections, five upcoming shows at a time, and progressive photo/video/article/band/merch lists. The monthly calendar is folded until opened. Desktop disclosures remain open and all collection items remain visible.
- Closing Videos on a phone stops hidden playback and restores the play button.
- Contact form validates name, email and message before opening the visitor's email app. It does not send mail itself.

## Verification

- 154 focused checks passed: loader lifecycle, date/time and interaction handling, and timed-only calendar behavior including stale cached data, Eastern time/DST boundaries, pagination, navigation, timeouts and stale requests. This includes 63 mobile checks for folding, keyboard controls, anchor navigation, collection expansion, desktop restoration, event batches and stopping hidden players.
- Four JavaScript syntax checks passed. Structured data parses successfully.
- 236 local references resolve; all 155 distinct local HTTP requests including the page returned 200 with contents matching the saved files. All 24 anchor references resolve; no duplicate IDs.
- Live calendar list and monthly grid render real timed shows. October and November navigation, Today, monthly event dialogs and keyboard closing were checked in Chrome. Opening/closure all-day entries do not appear.
- All eight YouTube videos were played in Chrome with advancing playback time and Pause controls. Seven original videos were tested with unchanged player code before v7; the newly requested L8kKTez3DIg video was played in final v7.
- Google Maps rendered the correct Inn marker and map. The direct map link remains available.
- Desktop navigation sections, mobile menu, photo/merch viewer controls and form validation were checked. Layouts were inspected at widths 1440, 1280, 768, 390 and 320 pixels. A measured Contact/Live Tonight overlap at 1280 pixels was corrected and rechecked. Narrow phone views have no horizontal overflow and show the month as an agenda.
- The latest phone review measured about 88% less initial page length at 390 pixels wide than the prior v7 layout (3,128 versus 26,366 pixels). At 320 and 390 pixels, the page has no horizontal overflow. Chrome checks confirmed all five collection controls, keyboard folding, menu/footer anchor reveal, photo viewing, monthly expansion, five-to-ten event loading, and desktop restoration.
- The transparent loader was visually inspected on its final black background. The original photographs were retained; no stock photos were added.

## External links and limits

The final page contains 52 unique external anchor destinations. A 74-URL network audit covered the preceding saved source and its unchanged destinations, video metadata/thumbnails and embed endpoints; the new requested video was additionally checked through official YouTube metadata and actual playback. No retained destination is confirmed broken. Some publishers or social profiles restrict automatic content verification, so these are explicitly limited rather than claimed fully verified.

| Destination | Verification limit |
| --- | --- |
| [forums.egullet.org](https://forums.egullet.org/topic/43122-great-notch-inn/) | HTTP 200 delivers bot challenge; content requires browser/user completion. |
| [hotmonksluv.com](https://hotmonksluv.com/) | 406 ModSecurity. Not proven broken. |
| [njmonthly.com](https://njmonthly.com/articles/eat-drink/the-best-bars-in-new-jersey/) | 403 Cloudflare. Not proven broken. |
| [www.betteroffdead.com](https://www.betteroffdead.com) | 406 ModSecurity. Not proven broken. |
| [www.facebook.com](https://www.facebook.com/andylackow) | HTTP 200 generic Facebook shell; individual profile content not verified without sign-in. |
| [www.facebook.com](https://www.facebook.com/jack.c.romano.3) | HTTP 200 generic Facebook shell; individual profile content not verified without sign-in. |
| [www.facebook.com](https://www.facebook.com/james.mcgill.823601) | HTTP 200 generic Facebook shell; individual profile content not verified without sign-in. |
| [www.facebook.com](https://www.facebook.com/thenitrobluesband) | HTTP 200 generic Facebook shell; individual profile content not verified without sign-in. |
| [www.northjersey.com](https://www.northjersey.com/story/entertainment/dining/2025/11/21/great-notch-inn-nj-clifton-best-dives-bars-us/87379877007/) | 402 Access Restricted. Not proven broken; publisher/paywall limits automatic validation. |

Removed obsolete FunNewJersey and Montclair PDF destinations. Updated Sharp Edge, Hot Monkey Love, Slippery Chickens and Earthgrinders links. Morningwood Brothers uses its verified working HTTP destination because its HTTPS endpoint fails; this is an external navigation link.

Telephone and email links were checked for correct destinations. No calls or messages were sent. Dynamic Google event links were checked for valid HTTPS Calendar routes; a representative event detail was opened. Third-party availability may change after this check.

## Local viewing

Double-click Start Preview.command inside v7. It opens the saved site at a local web address and supplies the referrer required by YouTube. Close its window or press Control-C when finished. Opening index.html directly does not provide that YouTube referrer.

## Image-edit record

Mode: built-in image_gen; transparent background enabled. Final asset: images/great-notch-logo-transparent.png. The standalone copy is great-notch-inn-logo-transparent.png beside this report in the delivered outputs.

Final prompt:

Use case: background-extraction. Edit target: the supplied authentic Great Notch Inn logo artwork. Primary request: remove only the black/dark gray fabric background and make it genuinely transparent, including the empty negative spaces around and between the printed artwork. Preserve the entire original logo exactly: the red and cream Great Notch Inn wordmark, gold oval, white musical notes, detailed red/gold roadhouse, both white motorcycles, Est. 1939, New Jersey's Rockin' Roadhouse!, RT. 46 WEST IN LITTLE FALLS NJ, and www.GREATNOTCHINN.COM. Keep the same composition, shapes, lettering, spelling, colors, texture and relative sizes. Do not redesign, retype, simplify, add or remove printed elements. Retain dark architectural details that are part of the artwork itself, but remove the unprinted fabric background. All lettering and motorcycle lines must have clean intact edges with no dark fabric rectangle or halo. Return a PNG with a real alpha channel, not a checkerboard pattern. Keep all original artwork fully in frame with a small transparent margin.
