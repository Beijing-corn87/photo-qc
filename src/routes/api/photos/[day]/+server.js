import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

// This path needs to be absolute on the server where the app is running
const PHOTOS_DIR = '/home/shmolph/photos';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { day } = params;
  const imagePath = join(PHOTOS_DIR, day);

  try {
    const imageBuffer = readFileSync(imagePath);
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': 'http://100.80.225.99:5173',
      },
    });
  } catch (err) {
    console.error(`Failed to read image ${imagePath}:`, err);
    throw error(404, 'Image not found');
  }
}
