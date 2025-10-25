import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const { day } = params;
	const { description } = await request.json();

	if (description) {
		console.log(`Received regeneration request for ${day} with description: "${description}"`);
	} else {
		console.log(`Received regeneration request for ${day} with no description.`);
	}

	// TODO: Add your actual backend logic here to regenerate the single image,
	// using the description if provided.

	return json({ message: `Regeneration for ${day} has been started.` });
}