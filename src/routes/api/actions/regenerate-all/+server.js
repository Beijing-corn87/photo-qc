import { json } from '@sveltejs/kit';

/** POST /api/actions/regenerate-all */
export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	console.log('[api/actions/regenerate-all] Regenerate-all request', body);

	const EXTERNAL_BASE = process.env.VITE_API_BASE || process.env.API_BASE || '';
	if (EXTERNAL_BASE) {
		try {
			const target = `${EXTERNAL_BASE.replace(/\/$/, '')}/api/actions/regenerate-all`;
			console.log(`[api/actions/regenerate-all] Forwarding to ${target}`);
			const resp = await fetch(target, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const text = await resp.text();
			return new Response(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } });
		} catch (err) {
			console.error('[api/actions/regenerate-all] Forwarding failed:', err);
			return json({ message: `Failed to forward batch regenerate`, error: err.message }, { status: 502 });
		}
	}

	// TODO: start batch job for regeneration
	return json({ message: 'Batch regeneration started.' });
}
