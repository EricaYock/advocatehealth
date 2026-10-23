# tabs-finder

Custom **tabs** block. Purpose: Tabbed finder band (Find a doctor / Find a location).

## Authoring (Document Authoring)

Model: `standalone`

**Code-owned — not editable on the page.** Authors only place an empty block table named `Tabs Finder` where the finder should appear. Any rows typed into the block are ignored; the tabs, text and links are rendered by `tabs-finder.js`.

## Changing the wording or links

Site admins can override the defaults (and localize them) in the site's `placeholders` sheet:

| Key | Default |
| --- | --- |
| `finder-doctor-tab` | Find a doctor |
| `finder-doctor-text` | Search for a doctor by name, specialty or location. |
| `finder-doctor-link` | Find a doctor |
| `finder-doctor-url` | /doctors |
| `finder-location-tab` | Find a location |
| `finder-location-text` | Search for a hospital, clinic or care location near you. |
| `finder-location-link` | Find a location |
| `finder-location-url` | /locations |

Adding or removing tabs requires a code change (`FINDER_TABS` in `tabs-finder.js`).

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
