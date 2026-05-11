import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EventEmitter } from 'node:events';
import { createViteLoader } from '../../../dist/core/module-loader/vite.js';

// Minimal mock structures for viteServer and ssrEnvironment.
// Only the properties accessed during construction and by getSSREnvironment()
// are populated.

function createMockEnvironment(name: string) {
	return {
		name,
		config: { server: { https: false } },
		runner: {
			import: async () => ({}),
		},
		pluginContainer: {
			resolveId: async () => null,
			getModuleInfo: () => null,
		},
		moduleGraph: {
			getModuleById: () => undefined,
			getModulesByFile: () => undefined,
			idToModuleMap: new Map(),
			invalidateModule: () => {},
		},
	} as any;
}

function createMockViteServer(ssrEnv: any, prerenderEnv: any) {
	const emitter = new EventEmitter();
	return {
		environments: {
			client: {
				hot: {
					send: () => {},
				},
			},
			ssr: ssrEnv,
			prerender: prerenderEnv,
		},
		watcher: emitter,
		ssrFixStacktrace: () => {},
		config: { root: '/tmp/test' },
	} as any;
}

describe('createViteLoader', () => {
	it('getSSREnvironment returns the environment passed to createViteLoader, not always ssr', () => {
		const ssrEnv = createMockEnvironment('ssr');
		const prerenderEnv = createMockEnvironment('prerender');
		const server = createMockViteServer(ssrEnv, prerenderEnv);

		// When createViteLoader is called with the prerender environment,
		// getSSREnvironment() should return that same environment — not the
		// server's ssr environment.
		const loader = createViteLoader(server, prerenderEnv);
		const returnedEnv = loader.getSSREnvironment();

		assert.equal(
			returnedEnv,
			prerenderEnv,
			'getSSREnvironment() should return the environment that was passed to createViteLoader',
		);
		assert.notEqual(
			returnedEnv,
			ssrEnv,
			'getSSREnvironment() should NOT return the ssr environment when a different one was passed',
		);
	});

	it('getSSREnvironment returns ssr environment when ssr was passed', () => {
		const ssrEnv = createMockEnvironment('ssr');
		const prerenderEnv = createMockEnvironment('prerender');
		const server = createMockViteServer(ssrEnv, prerenderEnv);

		// Normal case: when createViteLoader is called with the ssr environment,
		// getSSREnvironment() should also return it.
		const loader = createViteLoader(server, ssrEnv);
		const returnedEnv = loader.getSSREnvironment();

		assert.equal(
			returnedEnv,
			ssrEnv,
			'getSSREnvironment() should return the ssr environment when that was passed',
		);
	});
});
