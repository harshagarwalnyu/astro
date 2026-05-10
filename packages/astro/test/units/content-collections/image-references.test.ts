import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { updateImageReferencesInData } from '../../../dist/content/runtime.js';
import { imageSrcToImportId } from '../../../dist/assets/utils/resolveImports.js';
import type { ImageMetadata } from '../../../dist/assets/types.js';

const IMAGE_PREFIX = '__ASTRO_IMAGE_';
const FILE_NAME = 'src/content/blog/post.md';

function makeImageMap(src: string, meta: ImageMetadata): Map<string, ImageMetadata> {
	const id = imageSrcToImportId(src, FILE_NAME);
	assert.ok(id, `imageSrcToImportId returned undefined for src="${src}"`);
	return new Map([[id, meta]]);
}

const heroMeta: ImageMetadata = {
	src: '/_astro/hero.abc123.png',
	width: 800,
	height: 600,
	format: 'png',
};

describe('updateImageReferencesInData', () => {
	it('replaces a top-level image placeholder with resolved ImageMetadata', () => {
		const data = { image: `${IMAGE_PREFIX}./hero.png` };
		const map = makeImageMap('./hero.png', heroMeta);
		const result = updateImageReferencesInData(data, FILE_NAME, map);
		assert.deepEqual(result.image, heroMeta);
	});

	it('resolves an image nested inside an object', () => {
		const data = { cover: { src: `${IMAGE_PREFIX}./hero.png`, alt: 'Hero' } };
		const map = makeImageMap('./hero.png', heroMeta);
		const result = updateImageReferencesInData(data, FILE_NAME, map);
		assert.deepEqual(result.cover.src, heroMeta);
	});

	it('resolves images nested inside an array', () => {
		const data = {
			gallery: [`${IMAGE_PREFIX}./hero.png`, `${IMAGE_PREFIX}./hero.png`],
		};
		const map = makeImageMap('./hero.png', heroMeta);
		const result = updateImageReferencesInData(data, FILE_NAME, map);
		assert.deepEqual(result.gallery[0], heroMeta);
		assert.deepEqual(result.gallery[1], heroMeta);
	});

	it('falls back to the raw src string when the id is not in the map', () => {
		const data = { image: `${IMAGE_PREFIX}./missing.png` };
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.equal(result.image, './missing.png');
	});

	it('leaves non-image strings unchanged', () => {
		const data = { title: 'Hello', slug: 'hello-world' };
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.equal(result.title, 'Hello');
		assert.equal(result.slug, 'hello-world');
	});

	it('handles an empty imageAssetMap gracefully', () => {
		const data = { image: `${IMAGE_PREFIX}./hero.png` };
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.equal(result.image, './hero.png');
	});

	it('handles undefined imageAssetMap — falls back to raw src', () => {
		const data = { image: `${IMAGE_PREFIX}./hero.png` };
		const result = updateImageReferencesInData(data, FILE_NAME, undefined);
		assert.equal(result.image, './hero.png');
	});

	it('handles data with no image fields', () => {
		const data = { title: 'My Post', tags: ['a', 'b'], count: 3 };
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.deepEqual(result, data);
	});

	it('preserves Map objects in data without breaking their methods', () => {
		const data = {
			title: 'Post',
			tags: new Map([
				['lang', 'en'],
				['category', 'blog'],
			]),
		};
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.ok(result.tags instanceof Map, 'tags should still be a Map instance');
		assert.equal(result.tags.get('lang'), 'en');
		assert.equal(result.tags.get('category'), 'blog');
		assert.equal(result.tags.size, 2);
	});

	it('preserves Set objects in data without breaking their methods', () => {
		const data = {
			title: 'Post',
			categories: new Set(['blog', 'tutorial', 'astro']),
		};
		const result = updateImageReferencesInData(data, FILE_NAME, new Map());
		assert.ok(result.categories instanceof Set, 'categories should still be a Set instance');
		assert.ok(result.categories.has('blog'));
		assert.ok(result.categories.has('tutorial'));
		assert.ok(result.categories.has('astro'));
		assert.equal(result.categories.size, 3);
	});

	it('preserves Map and Set alongside image resolution', () => {
		const data = {
			image: `${IMAGE_PREFIX}./hero.png`,
			tags: new Map([['lang', 'en']]),
			categories: new Set(['blog']),
		};
		const map = makeImageMap('./hero.png', heroMeta);
		const result = updateImageReferencesInData(data, FILE_NAME, map);
		assert.deepEqual(result.image, heroMeta);
		assert.ok(result.tags instanceof Map);
		assert.equal(result.tags.get('lang'), 'en');
		assert.ok(result.categories instanceof Set);
		assert.ok(result.categories.has('blog'));
	});

	it('resolves multiple different images in the same entry', () => {
		const thumbMeta: ImageMetadata = {
			src: '/_astro/thumb.xyz.png',
			width: 100,
			height: 100,
			format: 'png',
		};
		const heroId = imageSrcToImportId('./hero.png', FILE_NAME);
		const thumbId = imageSrcToImportId('./thumb.png', FILE_NAME);
		assert.ok(heroId);
		assert.ok(thumbId);
		const map = new Map<string, ImageMetadata>([
			[heroId, heroMeta],
			[thumbId, thumbMeta],
		]);
		const data = {
			hero: `${IMAGE_PREFIX}./hero.png`,
			thumb: `${IMAGE_PREFIX}./thumb.png`,
		};
		const result = updateImageReferencesInData(data, FILE_NAME, map);
		assert.deepEqual(result.hero, heroMeta);
		assert.deepEqual(result.thumb, thumbMeta);
	});
});
