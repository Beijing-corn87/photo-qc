import { json } from '@sveltejs/kit';

/** POST /api/actions/regenerate-all */
export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	console.log('[api/actions/regenerate-all] Regenerate-all request', body);

	// TODO: start batch job for regeneration
	return json({ message: 'Batch regeneration started.' });
}
