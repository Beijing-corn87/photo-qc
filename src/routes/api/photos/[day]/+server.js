import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

// This path needs to be absolute on the server where the app is running
const PHOTOS_DIR = '/home/shmolph/photos';
const NOCO_DB_URL = 'http://100.94.216.120';
const NOCO_API_KEY = 'Uh8b1i_oPugRDcHwG84pkXeiRfUHeluDD9LnyXtX';

const dayToId = {
  saturday: 1,
  sunday: 2,
  monday: 3,
  tuesday: 4,
  wednesday: 5,
  thursday: 6,
  friday: 7,
};

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { day } = params;
  const imagePath = join(PHOTOS_DIR, day);

  // First, try external API (default to localhost:3000) to fetch the image/status.
  const EXTERNAL_BASE = process.env.API_BASE || process.env.VITE_API_BASE || 'http://localhost:3000';
  try {
    const target = `${EXTERNAL_BASE.replace(/\/$/, '')}/api/photos/${day}`;
    console.log(`[api/photos] Attempting to fetch from external API ${target}`);
    const extResp = await fetch(target);
    if (extResp.ok) {
      // Proxy whatever the external server returned (image or 202)
      const buffer = await extResp.arrayBuffer();
      const headers = {
        'Cache-Control': extResp.headers.get('cache-control') || 'public, max-age=604800',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': extResp.headers.get('content-type') || 'application/octet-stream'
      };
      return new Response(Buffer.from(buffer), { status: extResp.status, headers });
    } else if (extResp.status === 202) {
      return new Response('Image is being generated', { status: 202, headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      console.log(`[api/photos] External API returned ${extResp.status}, falling back to local file`);
    }
  } catch (err) {
    console.error(`[api/photos] External fetch failed:`, err);
    // fall back to local file system
  }

  // If external failed or returned non-OK, fall back to local file system
  try {
    const imageBuffer = readFileSync(imagePath);
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*', // More flexible for dev
      },
    });
  } catch (err) {
    console.error(`Failed to read image ${imagePath}:`, err);
    throw error(404, 'Image not found');
  }
}
