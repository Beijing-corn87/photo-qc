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

  const id = dayToId[day.toLowerCase()];
  if (id) {
    const nocoUrl = `${NOCO_DB_URL}/api/v1/db/data/noco/N8n_data/images/${id}`;
    try {
      const nocoResponse = await fetch(nocoUrl, {
        headers: {
          'xc-token': NOCO_API_KEY,
        },
      });

      if (nocoResponse.ok) {
        const nocoData = await nocoResponse.json();
        if (nocoData.beingGenerated) {
          return new Response('Image is being generated', {
            status: 202,
            headers: {
              'Access-Control-Allow-Origin': 'http://100.80.225.99:5173',
            },
          });
        }
      }
    } catch (err) {
      console.error(`Failed to connect to NocoDB:`, err);
      // Decide if you want to fall back to serving the image or show an error
    }
  }

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
