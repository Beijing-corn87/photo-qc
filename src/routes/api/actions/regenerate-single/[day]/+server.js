import { json } from '@sveltejs/kit';

/** POST /api/actions/regenerate-single/:day */
export async function POST({ params, request }) {
	const { day } = params;
	const body = await request.json().catch(() => ({}));
	console.log(`[api/actions/regenerate-single] Regenerate request for ${day}`, body);

	// TODO: dispatch regenerate job here (e.g., enqueue, call AI service, etc.)
	return json({ message: `Regeneration for ${day} started.` });
}
