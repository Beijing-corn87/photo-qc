import { json } from '@sveltejs/kit';

/** POST /api/actions/approve/:day */
export async function POST({ params, request }) {
	const { day } = params;
	const body = await request.json().catch(() => ({}));
	console.log(`[api/actions/approve] Approve request for ${day}`, body);

	// TODO: integrate with real backend (database/webhook) here.
	return json({ message: `Photo for ${day} approved.` });
}
