import { cssFitValues } from '../internal.js';

export function generateImageStylesCSS(
	defaultObjectFit?: string,
	defaultObjectPosition?: string,
): string {
	const fitStyles = cssFitValues
		.map(
			(fit) => `
[data-astro-image-fit="${fit}"] {
  object-fit: ${fit};
}`,
		)
		.join('\n');

	const defaultFitStyle =
		defaultObjectFit && cssFitValues.includes(defaultObjectFit)
			? `
:where([data-astro-image]:not([data-astro-image-fit])) {
  object-fit: ${defaultObjectFit};
}`
			: '';

	const positionStyle = defaultObjectPosition
		? `
[data-astro-image-pos="${defaultObjectPosition.replace(/\s+/g, '-')}"] {
  object-position: ${defaultObjectPosition};
}

:where([data-astro-image]:not([data-astro-image-pos])) {
  object-position: ${defaultObjectPosition};
}`
		: '';
	return `
:where([data-astro-image]) {
  height: auto;
}
:where([data-astro-image="full-width"]) {
  width: 100%;
}
:where([data-astro-image="constrained"]) {
  max-width: 100%;
}
${fitStyles}
${defaultFitStyle}
${positionStyle}
`.trim();
}

/**
 * Generate minimal CSS for image position styling without the full responsive image styles.
 * This is used when `responsiveStyles` is disabled but a layout is still used,
 * ensuring object-position works via data attributes instead of inline styles (CSP-compliant).
 */
export function generateImagePositionCSS(objectPosition: string): string {
	const normalizedPos = objectPosition.replace(/\s+/g, '-');
	return `[data-astro-image-pos="${normalizedPos}"]{object-position:${objectPosition}}`
}
