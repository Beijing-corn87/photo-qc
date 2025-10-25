<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	const API_BASE = 'http://localhost:3000';
	const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	// default to monday if no day param is present (e.g. visiting `/`)
	let currentDay = 'monday';
	
	// Track loaded images and their states in the gallery
	let galleryImages = days.reduce((acc, day) => ({ ...acc, [day]: { 
		url: '', 
		status: 'loading',
		isHovered: false 
	}}), {});

	// Be defensive: `$page` may be undefined during some SSR or navigation states,
	// and `params.day` may be missing — avoid calling `toLowerCase` on undefined.
	$: {
		const dayParam = $page?.params?.day;

		if (typeof dayParam === 'string' && dayParam.trim()) {
	 		currentDay = dayParam.toLowerCase();
	 	} else if (!currentDay) {
	 		currentDay = 'monday';
	 	}
	}

	// Load all images when in gallery view
	$: if (showGallery) {
		days.forEach(day => {
			fetchImage(day, true);
		});
	}

	$: currentIndex = days.indexOf(currentDay);

	let imageStatus = 'loading'; // 'loading', 'loaded', 'generating', 'error'
	let errorMessage = 'Not Generated';
	let imageUrl = '';

	let showRegenModal = false;
	let regenDescription = '';
	let noDescription = false;
// When true, show the gallery/main menu. When false, show the single-day detail view.
let showGallery = true;

	async function fetchImage(day, isGallery = false) {
		if (isGallery) {
			galleryImages[day].status = 'loading';
		} else {
			imageStatus = 'loading';
		}

		try {
			const response = await fetch(`${API_BASE}/api/photos/${day}`);
			if (response.ok) {
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				
				if (isGallery) {
					galleryImages[day] = {
						...galleryImages[day],
						url,
						status: 'loaded'
					};
				} else {
					imageUrl = url;
					imageStatus = 'loaded';
				}
			} else if (response.status === 202) {
				if (isGallery) {
					galleryImages[day].status = 'generating';
				} else {
					imageStatus = 'generating';
				}
			} else {
				const error = (await response.text()) || 'Image not found';
				if (isGallery) {
					galleryImages[day] = {
						...galleryImages[day],
						status: 'error',
						error
					};
				} else {
					errorMessage = error;
					imageStatus = 'error';
				}
			}
		} catch (err) {
			console.error(`Failed to fetch image for ${day}:`, err);
			const error = 'Failed to load image.';
			if (isGallery) {
				galleryImages[day] = {
					...galleryImages[day],
					status: 'error',
					error
				};
			} else {
				errorMessage = error;
				imageStatus = 'error';
			}
		}
	}

	let showBatchRegenModal = false;
	let batchRegenDescription = '';
	
	async function handleBatchRegen() {
		try {
			const response = await fetch(`${API_BASE}/api/actions/regenerate-all`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: batchRegenDescription })
			});
			
			const result = await response.json();
			if (response.ok) {
				alert(result.message || 'Batch regeneration started');
				showBatchRegenModal = false;
				// Refresh all images after a short delay
				setTimeout(() => {
					days.forEach(day => fetchImage(day, true));
				}, 1000);
			} else {
				alert(`Error: ${result.message}`);
			}
		} catch (err) {
			console.error('Failed to start batch regeneration:', err);
			alert('Failed to start batch regeneration');
		}
	}

	onMount(() => {
		fetchImage(currentDay);
		// If we start in detail view (a day param exists), load that image.
		if (!showGallery) {
			fetchImage(currentDay);
		}

		const handleKeydown = (e) => {
			if (e.key === 'ArrowLeft') navigate(-1);
			if (e.key === 'ArrowRight') navigate(1);
		};
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function navigate(direction) {
		// Update local state instead of navigating the browser — keep the URL on the main menu
		const newIndex = (currentIndex + direction + days.length) % days.length;
		currentDay = days[newIndex];
		// reactive `currentIndex` will update from `currentDay`, and we need to load the image
		fetchImage(currentDay);
	}

	function openDetail(day) {
		showGallery = false;
		currentDay = day;
		fetchImage(currentDay);
	}

	async function handleAction(action) {
		let url, options;

		if (action === 'approve') {
			url = `${API_BASE}/api/actions/approve/${currentDay}`;
			options = { method: 'POST' };
		} else if (action === 'regenerate') {
			if (noDescription) {
				regenDescription = '';
			}
			if (!noDescription && !regenDescription.trim()) {
				alert('Please provide a description or check the box to regenerate without one.');
				return;
			}
			url = `${API_BASE}/api/actions/regenerate-single/${currentDay}`;
			options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: regenDescription })
			};
		}

		try {
			const response = await fetch(url, options);
			const result = await response.json();
			if (response.ok) {
				alert(result.message);
				showRegenModal = false;
				// Refresh the image status
				setTimeout(() => fetchImage(currentDay), 1000);
			} else {
				alert(`Error: ${result.message}`);
			}
		} catch (err) {
			console.error(`Failed to ${action} ${currentDay}:`, err);
			alert(`An error occurred during the ${action} action.`);
		}
	}
</script>

<svelte:head>
	<title>QC - {currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}</title>
</svelte:head>

<main class="main-container">
	<div class="image-scroll-container">
		<div class="image-wrapper">
			<div class="day-header">
				<a href="/" class="back-link" on:click|preventDefault={() => (showGallery = true)}>&larr; Gallery</a>
				<h1>{currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}</h1>
			</div>

			<div class="image-content">
				{#if imageStatus === 'loading'}
					<div class="placeholder">Loading...</div>
				{:else if imageStatus === 'generating'}
					<div class="placeholder">Image is being generated...</div>
				{:else if imageStatus === 'error'}
					<div class="placeholder">{errorMessage}</div>
				{:else if imageStatus === 'loaded'}
					<img src={imageUrl} alt={currentDay} />
				{/if}
			</div>

			<div class="actions">
				<button class="approve" on:click={() => handleAction('approve')}>Approve</button>
				<button class="regenerate" on:click={() => (showRegenModal = true)}>Regenerate</button>
			</div>
		</div>
	</div>

	{#if showGallery}
		<div class="gallery-container">
			<div class="gallery">
				<div class="gallery-header">
					<h1>Photo Gallery</h1>
					<button class="batch-regen" on:click={() => showBatchRegenModal = true}>
						Regenerate All Photos
					</button>
				</div>
				<p class="gallery-subtitle">Hover over photos to approve or regenerate individually</p>
				<div class="gallery-grid">
					{#each days as d}
						<div 
							class="day-tile"
							on:mouseenter={() => galleryImages[d].isHovered = true}
							on:mouseleave={() => galleryImages[d].isHovered = false}
						>
							<div class="day-name">{d.charAt(0).toUpperCase() + d.slice(1)}</div>
							
							<div class="image-container" class:is-hovered={galleryImages[d].isHovered}>
								{#if galleryImages[d].status === 'loading'}
									<div class="placeholder">Loading...</div>
								{:else if galleryImages[d].status === 'generating'}
									<div class="placeholder">Generating...</div>
								{:else if galleryImages[d].status === 'error'}
									<div class="placeholder">{galleryImages[d].error || 'Error'}</div>
								{:else}
									<img src={galleryImages[d].url} alt={d} />
								{/if}

								{#if galleryImages[d].isHovered}
									<div class="hover-actions" transition:fade={{ duration: 150 }}>
										<div class="hover-buttons">
											<button 
												class="approve" 
												on:click|stopPropagation={() => handleAction('approve', d)}
											>
												Approve
											</button>
											<button 
												class="regenerate" 
												on:click|stopPropagation={() => {
													currentDay = d;
													showRegenModal = true;
												}}
											>
												Regenerate
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	<aside class="sidebar">
		<button on:click={() => navigate(-1)} aria-label="Previous Day">&lt;</button>
		<button on:click={() => navigate(1)} aria-label="Next Day">&gt;</button>
	</aside>
</main>

{#if showRegenModal || showBatchRegenModal}
	<div class="modal-backdrop" on:click={() => {
		showRegenModal = false;
		showBatchRegenModal = false;
	}}>
		<div class="modal-content" on:click|stopPropagation>
			<h2>{showBatchRegenModal ? 'Regenerate All Photos' : 'Regenerate Photo'}</h2>
			<p>
				{#if showBatchRegenModal}
					Provide an optional description to guide the regeneration of all photos.
				{:else}
					Provide a description for the changes you want, or check the box to regenerate without a specific prompt.
				{/if}
			</p>
			
			{#if showBatchRegenModal}
				<textarea 
					bind:value={batchRegenDescription} 
					placeholder="e.g., 'make all photos more vibrant', 'use forest backgrounds'..."
				></textarea>
			{:else}
				<textarea 
					bind:value={regenDescription} 
					placeholder="e.g., 'make it more vibrant', 'change the background to a forest'..." 
					disabled={noDescription}
				></textarea>
				<label>
					<input type="checkbox" bind:checked={noDescription} />
					Regenerate without a description
				</label>
			{/if}

			<div class="modal-actions">
				<button class="cancel" on:click={() => {
					showRegenModal = false;
					showBatchRegenModal = false;
				}}>Cancel</button>
				<button 
					class="submit-regen" 
					on:click={() => {
						if (showBatchRegenModal) {
							handleBatchRegen();
						} else {
							handleAction('regenerate');
						}
					}}
				>
					Submit
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.main-container {
		display: flex;
		height: 100vh;
		width: 100vw;
	}
	.image-scroll-container {
		flex-grow: 1;
		display: flex;
		overflow-x: hidden; /* We navigate via buttons, not scroll */
	}
	.image-wrapper {
		min-width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-color: var(--bg-color);
	}
	.day-header {
		position: absolute;
		top: 2rem;
		left: 2rem;
		right: 2rem;
		text-align: center;
	}
	.back-link {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-color);
		text-decoration: none;
		font-size: 1rem;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	.image-content {
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-height: calc(100% - 120px); /* Adjust for header and actions */
	}
	.image-content img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border: 1px solid var(--border-color);
	}
	.placeholder {
		width: 80%;
		height: 80%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px dashed var(--border-color);
		color: var(--text-color);
		font-size: 1.5rem;
	}
	.actions {
		padding-top: 1.5rem;
		display: flex;
		gap: 1rem;
	}
	.actions button {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-family: 'Space Mono', monospace;
		font-size: 1rem;
		transition: background-color 0.2s;
	}
	.approve {
		background-color: var(--button-approve-bg);
		color: white;
	}
	.approve:hover {
		background-color: var(--button-approve-hover-bg);
	}
	.regenerate {
		background-color: var(--button-regenerate-bg);
		color: white;
	}
	.regenerate:hover {
		background-color: var(--button-regenerate-hover-bg);
	}
	.sidebar {
		flex-shrink: 0;
		width: 60px;
		background-color: var(--sidebar-bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	.sidebar button {
		width: 40px;
		height: 40px;
		background-color: var(--sidebar-button-bg);
		color: var(--sidebar-text);
		border: none;
		border-radius: 50%;
		font-size: 1.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.gallery-container {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: start;
		justify-content: center;
		padding: 2rem;
		background: var(--bg-color);
		z-index: 10;
		overflow-y: auto;
	}
	.gallery {
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
		text-align: center;
	}
	.gallery-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding: 0 1rem;
	}
	.gallery h1 {
		font-size: 2.5rem;
		color: var(--text-color);
		margin: 0;
	}
	.batch-regen {
		padding: 0.75rem 1.5rem;
		background: var(--button-regenerate-bg);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}
	.batch-regen:hover {
		background: var(--button-regenerate-hover-bg);
		transform: translateY(-1px);
	}
	.gallery-subtitle {
		color: var(--text-color);
		opacity: 0.7;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		padding: 1rem;
	}
	.day-tile {
		position: relative;
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		background: var(--card-bg);
		overflow: hidden;
		transition: transform 0.3s ease-in-out;
	}
	.day-tile:hover {
		transform: translateY(-4px);
	}
	.day-name {
		font-size: 1.25rem;
		font-weight: bold;
		padding: 1rem;
		color: var(--text-color);
		background: var(--card-bg);
		z-index: 2;
	}
	.image-container {
		position: relative;
		width: 100%;
		padding-bottom: 75%; /* 4:3 aspect ratio */
		background: var(--bg-color);
		overflow: hidden;
	}
	.image-container img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease-in-out;
	}
	.image-container.is-hovered img {
		transform: scale(1.05);
	}
	.placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-color);
		color: var(--text-color);
		font-size: 1rem;
	}
	.hover-actions {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		opacity: 0;
		animation: fadeIn 0.2s ease-out forwards;
	}
	.hover-buttons {
		display: flex;
		gap: 1rem;
		transform: translateY(20px);
		animation: slideUp 0.2s ease-out forwards;
	}
	.hover-buttons button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}
	.hover-buttons .approve {
		background: var(--button-approve-bg);
		color: white;
	}
	.hover-buttons .approve:hover {
		background: var(--button-approve-hover-bg);
		transform: translateY(-2px);
	}
	.hover-buttons .regenerate {
		background: var(--button-regenerate-bg);
		color: white;
	}
	.hover-buttons .regenerate:hover {
		background: var(--button-regenerate-hover-bg);
		transform: translateY(-2px);
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes slideUp {
		from { 
			transform: translateY(20px);
			opacity: 0;
		}
		to { 
			transform: translateY(0);
			opacity: 1;
		}
	}
	.sidebar button:hover {
		background-color: var(--sidebar-button-hover-bg);
	}

	/* Modal Styles */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}
	.modal-content {
		background-color: var(--card-bg);
		padding: 2rem;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.modal-content textarea {
		width: 100%;
		min-height: 100px;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 0.5rem;
		font-family: 'Space Mono', monospace;
	}
	.modal-content textarea:disabled {
		background-color: #444;
		cursor: not-allowed;
	}
	.modal-content label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}
	.modal-actions button {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-family: 'Space Mono', monospace;
	}
	.cancel {
		background-color: var(--sidebar-button-bg);
		color: var(--sidebar-text);
	}
	.submit-regen {
		background-color: var(--button-regenerate-bg);
		color: white;
	}
</style>