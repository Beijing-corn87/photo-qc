import { json } from '@sveltejs/kit';

/** POST /api/actions/regenerate-all */
export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	console.log('[api/actions/regenerate-all] Regenerate-all request', body);

	// Default to localhost:3000 when no env var is provided
	const EXTERNAL_BASE = process.env.API_BASE || process.env.VITE_API_BASE || 'http://localhost:3000';
	if (EXTERNAL_BASE) {
		try {
			const target = `${EXTERNAL_BASE.replace(/\/$/, '')}/api/actions/regenerate-all`;
			console.log(`[api/actions/regenerate-all] Forwarding to ${target}`);
			// Ensure external API receives 'the fix' field (or 'nil' when empty)
			const forwardBody = {
				action: body.action || 'regenerate-all',
				['the fix']: (body.description && String(body.description).trim()) ? body.description : 'nil'
			};
			const resp = await fetch(target, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(forwardBody)
			});
			const contentType = resp.headers.get('content-type') || 'application/json';
			const text = await resp.text();
			return new Response(text, { status: resp.status, headers: { 'Content-Type': contentType } });
		} catch (err) {
			console.error('[api/actions/regenerate-all] Forwarding failed:', err);
			return json({ message: `Failed to forward batch regenerate`, error: err.message }, { status: 502 });
		}
	}

	// TODO: start batch job for regeneration
	return json({ message: 'Batch regeneration started.' });
}
