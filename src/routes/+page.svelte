<script>
  import { onMount } from 'svelte';
  export let data;
  export let params;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const baseUrl = 'http://100.94.216.120/:5678/webhook/cf0bbfae-4acc-4663-9e95-af65c043e7ca';

  let currentDayIndex = 0;
  let imageErrors = {};
  daysOfWeek.forEach(day => (imageErrors[day] = false));

  let photoContainer;

  function handleImageError(day) {
    imageErrors = { ...imageErrors, [day]: true };
  }

  function handleClick(day, action) {
    const url = `${baseUrl}/${day}/${action}`;
    window.open(url, '_blank');
    if (action === 'regenerate') {
      // Force re-render of image by changing its src or key
      // For simplicity, we'll just reset the error state and hope it reloads
      imageErrors = { ...imageErrors, [day]: false };
      // A more robust solution might involve appending a timestamp to the src
      // or using a Svelte key directive to force component re-creation.
    }
  }

  function goToNextDay() {
    currentDayIndex = (currentDayIndex + 1) % daysOfWeek.length;
  }

  function goToPrevDay() {
    currentDayIndex = (currentDayIndex - 1 + daysOfWeek.length) % daysOfWeek.length;
  }

  // Scroll to the current day when currentDayIndex changes
  $: if (photoContainer) {
    const targetElement = photoContainer.children[currentDayIndex];
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  // Keyboard navigation
  onMount(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goToNextDay();
      } else if (event.key === 'ArrowLeft') {
        goToPrevDay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<style>
  .main-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden; /* Hide main layout scrollbar */
  }

  .photo-scroll-container {
    flex-grow: 1;
    display: flex;
    overflow-x: scroll; /* Enable horizontal scrolling */
    scroll-snap-type: x mandatory; /* Snap to full-screen images */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    scrollbar-width: none; /* Hide scrollbar for Firefox */
  }

  .photo-scroll-container::-webkit-scrollbar {
    display: none; /* Hide scrollbar for Chrome, Safari, Opera */
  }

  .photo-card {
    flex: 0 0 100vw; /* Each card takes full viewport width */
    height: 100vh; /* Each card takes full viewport height */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    scroll-snap-align: center; /* Snap to center of card */
    padding: 20px;
    text-align: center;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  .image-wrapper {
    width: 80vw; /* Adjust as needed */
    height: 70vh; /* Adjust as needed */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    border-radius: 8px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  .photo-card img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .not-generated-text {
    font-size: 1.5em;
    color: var(--text-color);
  }

  .photo-card h3 {
    font-size: 2em;
    margin-bottom: 20px;
    color: var(--text-color);
  }

  .buttons {
    display: flex;
    gap: 15px;
  }

  .buttons button {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    transition: background-color 0.2s ease, transform 0.1s ease;
    font-family: 'Roboto Mono', monospace;
  }

  .buttons button:active {
    transform: scale(0.98);
  }

  .buttons button.approve {
    background-color: var(--button-approve-bg);
    color: white;
  }

  .buttons button.approve:hover {
    background-color: var(--button-approve-hover-bg);
  }

  .buttons button.regenerate {
    background-color: var(--button-regenerate-bg);
    color: white;
  }

  .buttons button.regenerate:hover {
    background-color: var(--button-regenerate-hover-bg);
  }

  .sidebar {
    width: 80px; /* Fixed width for sidebar */
    background-color: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    gap: 30px;
    border-left: 1px solid var(--border-color);
  }

  .sidebar button {
    background-color: var(--sidebar-button-bg);
    color: var(--sidebar-text);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }

  .sidebar button:hover {
    background-color: var(--sidebar-button-hover-bg);
  }

  .sidebar button:active {
    transform: scale(0.95);
  }
</style>

<div class="main-layout">
  <div class="photo-scroll-container" bind:this={photoContainer}>
    {#each daysOfWeek as day, i}
      <div class="photo-card" id="day-{i}">
        <h3>{day}</h3>
        <div class="image-wrapper">
          {#if imageErrors[day]}
            <span class="not-generated-text">Not Generated</span>
          {:else}
            <img src="/api/photos/{day}" alt="Photo for {day}" on:error={() => handleImageError(day)} />
          {/if}
        </div>
        <div class="buttons">
          <button class="approve" on:click={() => handleClick(day, 'approve')}>Approve</button>
          <button class="regenerate" on:click={() => handleClick(day, 'regenerate')}>Regenerate</button>
        </div>
      </div>
    {/each}
  </div>

  <div class="sidebar">
    <button on:click={goToPrevDay}>&larr;</button>
    <button on:click={goToNextDay}>&rarr;</button>
  </div>
</div>