import { json } from '@sveltejs/kit';

/** POST /api/actions/approve/:day */
export async function POST({ params, request }) {
	const { day } = params;
	const body = await request.json().catch(() => ({}));
	console.log(`[api/actions/approve] Approve request for ${day}`, body);

	// If an external API base is configured (VITE_API_BASE or API_BASE env var), forward the request
	const EXTERNAL_BASE = process.env.VITE_API_BASE || process.env.API_BASE || '';
	if (EXTERNAL_BASE) {
		try {
			const target = `${EXTERNAL_BASE.replace(/\/$/, '')}/api/actions/approve/${day}`;
			console.log(`[api/actions/approve] Forwarding to ${target}`);
			const resp = await fetch(target, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const text = await resp.text();
			return new Response(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } });
		} catch (err) {
			console.error('[api/actions/approve] Forwarding failed:', err);
			return json({ message: `Failed to forward approve for ${day}`, error: err.message }, { status: 502 });
		}
	}

	// Local/mock handling
	return json({ message: `Photo for ${day} approved.` });
}
