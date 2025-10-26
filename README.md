# Photo QC App

A SvelteKit web application designed for quality control of daily photos. It displays seven photos, one for each day of the week, allowing users to approve or regenerate them via a simple interface.

## Features

*   **Dark Mode:** A sleek, dark user interface for comfortable viewing.
*   **Full-Screen Scrollable Images:** View each day's photo in full-screen, navigating horizontally between them.
*   **Sidebar Navigation:** Easily move between days using arrow buttons in a right-hand sidebar, or with keyboard arrow keys.
*   **Approve/Regenerate Actions:** Buttons under each photo to send GET requests to a backend API for approval or regeneration.
*   **Missing Image Handling:** Displays "Not Generated" for days where a photo file is not found.
*   **Custom Font:** Utilizes the 'Space Mono' font for a modern, clean look.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js** (LTS version recommended)
*   **npm** (comes with Node.js)

## Setup & Local Development

Follow these steps to get the application running on your local machine:

1.  **Navigate to the project directory:**
    ```bash
    cd /path/to/your/photo-qc-app
    ```
    (Replace `/path/to/your/photo-qc-app` with the actual path to this project on your Linux machine.)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Image Setup:**
    The application expects your image files to be located in `/home/shmolph/photos` on your Linux machine. The files should be named after the days of the week (e.g., `Monday`, `Tuesday`, `Wednesday`, etc.) **without a file extension**, even though they are PNG images.

    The application uses a SvelteKit server endpoint to serve these images, so no symbolic linking is required for the images themselves.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server is configured to listen on all network interfaces (`0.0.0.0`), so you can access it from other devices on your network using your machine's IP address (e.g., `http://your-ip-address:5173`).

5.  **Access the application:**
    Open your web browser and navigate to the dev server URL printed by Vite (for example, `http://<your-machine-ip>:5173`). Use the exact URL shown in the terminal after running `npm run dev`.

## Deployment to Production (Linux Server)

This application uses `@sveltejs/adapter-node` for production, which builds a standalone Node.js server.

1.  **Ensure `adapter-node` is installed and configured:**
    If you haven't already, install it:
    ```bash
    npm install @sveltejs/adapter-node
    ```
    And ensure your `svelte.config.js` looks like this:
    ```javascript
    import adapter from '@sveltejs/adapter-node';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
        kit: {
            adapter: adapter()
        }
    };

    export default config;
    ```

2.  **Build the project for production:**
    ```bash
    npm run build
    ```
    This will create a `build` directory containing your optimized application and server.

3.  **Deploy to your Linux server:**
    *   Copy the entire project directory (including `package.json`, `node_modules`, and the newly created `build` directory) to your production server.
    *   Ensure Node.js is installed on your production server.
    *   **Image Path:** Verify that the `/home/shmolph/photos` directory exists on your production server and contains the correctly named image files (e.g., `Monday`, `Tuesday`).

4.  **Start the production server:**
    Navigate to your project directory on the server and run:
    ```bash
    node build/index.js
    ```

5.  **Process Management (Recommended):**
    For continuous operation, use a process manager like PM2 to keep your Node.js server running in the background and restart it automatically if it crashes.
    ```bash
    # Install PM2 globally if you don't have it
    npm install -g pm2

    # Start your app with PM2
    pm2 start build/index.js --name "photo-qc-app"

    # Save PM2 process list to ensure it restarts on server reboot
    pm2 save
    ```

## Project Structure

```
. # Project Root
├── src/
│   ├── app.css             # Global styles (dark mode, custom font)
│   ├── app.html            # Main HTML template
│   ├── routes/
│   │   ├── +layout.svelte  # Global layout and style import
│   │   ├── +page.svelte    # Main application component (image display, navigation, buttons)
│   │   └── api/
│   │       └── photos/
│   │           └── [day]/
│   │               └── +server.js # API endpoint to serve images from /home/shmolph/photos
├── static/
│   └── # (empty, no longer used for images directly)
├── package.json
├── svelte.config.js
├── tsconfig.json
├── jsconfig.json
└── vite.config.js
```

## Troubleshooting

*   **`sh: 1: vite: not found`**: This usually means `npm install` did not complete successfully. Try running `npm install` again.
*   **White background / Generic font**: Ensure `src/routes/+layout.svelte` exists and correctly imports `../app.css`.
*   **Images not loading / "Not Generated"**: Verify that the image files (e.g., `Monday`, `Tuesday`) exist in `/home/shmolph/photos` on your Linux machine and that the server is running correctly.
*   **Frontend can't reach external API / "Failed to fetch" on Approve**: If you run a separate backend (for example on port 3000), set the Vite environment variable `VITE_API_BASE` to the API URL before starting the dev server. Example:

```powershell
$env:VITE_API_BASE = 'http://localhost:3000'
npm run dev
```

Or create a `.env` file in the project root with:

```
VITE_API_BASE=http://localhost:3000
```

If `VITE_API_BASE` is not set the frontend will call internal endpoints under `/api` (mock handlers are provided in `src/routes/api/actions`).

