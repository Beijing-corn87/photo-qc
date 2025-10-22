<script>
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const baseUrl = 'http://192.168.1.249:3000';

  // Reactive store to track image loading errors
  const imageErrors = {};
  daysOfWeek.forEach(day => (imageErrors[day] = false));

  function handleImageError(day) {
    imageErrors[day] = true;
  }

  async function handleClick(day, action) {
    const url = `${baseUrl}/${day}/${action}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`${day} ${action} successful!`);
        alert(`${day} ${action} successful!`);
        // If regenerate, reset error state to try loading image again
        if (action === 'regenerate') {
          imageErrors[day] = false;
        }
      } else {
        console.error(`Failed to ${action} ${day}: ${response.statusText}`);
        alert(`Failed to ${action} ${day}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing ${day}:`, error);
      alert(`Error ${action}ing ${day}: ${error.message}`);
    }
  }
</script>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    padding: 20px;
  }
  .photo-card {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
  }
  .image-wrapper {
    width: 200px; /* Fixed width for consistency */
    height: 150px; /* Fixed height for consistency */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px auto;
    border-radius: 4px;
    background-color: #f0f0f0;
    color: #666;
    font-size: 0.9em;
    overflow: hidden; /* Hide overflow if image is larger */
  }
  .photo-card img {
    max-width: 100%;
    max-height: 100%;
    display: block;
    object-fit: contain; /* Ensure image fits within bounds */
  }
  .photo-card h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }
  .buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .buttons button {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s ease;
  }
  .buttons button.approve {
    background-color: #4CAF50;
    color: white;
  }
  .buttons button.approve:hover {
    background-color: #45a049;
  }
  .buttons button.regenerate {
    background-color: #f44336;
    color: white;
  }
  .buttons button.regenerate:hover {
    background-color: #da190b;
  }
</style>

<div class="container">
  {#each daysOfWeek as day}
    <div class="photo-card">
      <h3>{day}</h3>
      <div class="image-wrapper">
        {#if imageErrors[day]}
          <span>Not Generated</span>
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
