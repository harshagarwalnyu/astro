---
'astro': patch
---

Fixes responsive images violating Content Security Policy (CSP) when both `image.layout` and `security.csp` are enabled.

Previously, the `<Image>` and `<Picture>` components added an inline `style="object-position: center"` attribute to every responsive image. This violated CSP's `style-src 'self'` directive because inline style attributes require `'unsafe-hashes'` to be permitted, which Astro's CSP system does not support.

The fix removes the inline style injection and instead delivers `object-position` CSS via a virtual CSS module that gets processed by Vite and injected as a `<style>` tag in the `<head>`. This `<style>` tag is automatically hashed by Astro's CSP system, making it fully CSP-compliant.

The `data-astro-image-pos` data attribute continues to be set on responsive images, providing a CSS target for both the built-in styles and custom user styles.
