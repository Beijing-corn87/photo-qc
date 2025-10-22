import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapters
		// for a list. If your environment is not supported or you prefer a static site to be
		// generated (for example, for deployment to a static host), see https://kit.svelte.dev/docs/adapters#static-sites
		// for more information about installing adapters.
		adapter: adapter()
	}
};

export default config;
