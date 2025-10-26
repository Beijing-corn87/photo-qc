import { json } from '@sveltejs/kit';

/** POST /api/actions/regenerate-single/:day */
export async function POST({ params, request }) {
	const { day } = params;
	const body = await request.json().catch(() => ({}));
	console.log(`[api/actions/regenerate-single] Regenerate request for ${day}`, body);

	// Default to localhost:3000 when no env var is provided
	const EXTERNAL_BASE = process.env.API_BASE || process.env.VITE_API_BASE || 'http://localhost:3000';
	if (EXTERNAL_BASE) {
		try {
			const target = `${EXTERNAL_BASE.replace(/\/$/, '')}/api/actions/regenerate-single/${day}`;
			console.log(`[api/actions/regenerate-single] Forwarding to ${target}`);
			// Transform incoming body so external API receives 'the fix' field
			const forwardBody = {
				day,
				action: body.action || 'regenerated',
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
			console.error('[api/actions/regenerate-single] Forwarding failed:', err);
			return json({ message: `Failed to forward regenerate for ${day}`, error: err.message }, { status: 502 });
		}
	}

	// TODO: dispatch regenerate job here (e.g., enqueue, call AI service, etc.)
	return json({ message: `Regeneration for ${day} started.` });
}
