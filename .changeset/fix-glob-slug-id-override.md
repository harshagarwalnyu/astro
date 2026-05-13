---
'astro': patch
---

Fixes an issue where `CollectionEntry.id` would return the frontmatter `slug` value instead of the file-path-derived ID when using the `glob()` loader. The `slug` field in frontmatter is no longer treated as a special property for non-legacy content collections. If you need a custom ID, use the `generateId` option on the `glob()` loader.
