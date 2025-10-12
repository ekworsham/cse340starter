// filepath: public/js/favorites.js
document.addEventListener('DOMContentLoaded', function() {
  // Handle favorite heart clicks
  document.addEventListener('click', function(e) {
    if (e.target.closest('.favorite-heart')) {
      e.preventDefault()
      const button = e.target.closest('.favorite-heart')
      const invId = button.dataset.invId
      
      toggleFavorite(invId, button)
    }
    
    // Handle remove favorite buttons
    if (e.target.classList.contains('remove-favorite')) {
      e.preventDefault()
      const button = e.target
      const invId = button.dataset.invId
      
      if (confirm('Are you sure you want to remove this vehicle from your favorites?')) {
        removeFavorite(invId, button)
      }
    }
  })
  
  // Load initial favorite states
  loadFavoriteStates()
})

async function toggleFavorite(invId, button) {
  try {
    const response = await fetch('/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ inv_id: invId })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Update heart appearance
      if (result.isFavorite) {
        button.classList.add('favorited')
        button.title = 'Remove from favorites'
      } else {
        button.classList.remove('favorited')
        button.title = 'Add to favorites'
      }
      
      // Show flash message
      showFlashMessage(result.message, 'notice')
    } else {
      showFlashMessage(result.message, 'error')
    }
    
  } catch (error) {
    console.error('Error toggling favorite:', error)
    showFlashMessage('An error occurred. Please try again.', 'error')
  }
}

async function removeFavorite(invId, button) {
  try {
    const response = await fetch('/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ inv_id: invId })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Remove the favorite item from the page
      const favoriteItem = button.closest('.favorite-item')
      favoriteItem.remove()
      
      // Check if favorites list is empty
      const favoritesList = document.querySelector('#favorites-display ul')
      if (favoritesList && favoritesList.children.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">You haven\'t added any vehicles to your favorites yet. <a href="/inv/browse">Browse vehicles</a> to find vehicles you love!</p>'
      }
      
      showFlashMessage(result.message, 'notice')
    } else {
      showFlashMessage(result.message, 'error')
    }
    
  } catch (error) {
    console.error('Error removing favorite:', error)
    showFlashMessage('An error occurred. Please try again.', 'error')
  }
}

async function loadFavoriteStates() {
  const hearts = document.querySelectorAll('.favorite-heart')
  
  for (const heart of hearts) {
    const invId = heart.dataset.invId
    
    try {
      const response = await fetch(`/favorites/check/${invId}`)
      const result = await response.json()
      
      if (result.isFavorite) {
        heart.classList.add('favorited')
        heart.title = 'Remove from favorites'
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }
}

function showFlashMessage(message, type) {
  // Create flash message element
  const flash = document.createElement('div')
  flash.className = `flash ${type}`
  flash.textContent = message
  
  // Insert at top of main content
  const main = document.querySelector('main')
  main.insertBefore(flash, main.firstChild)
  
  // Remove after 5 seconds
  setTimeout(() => {
    flash.remove()
  }, 5000)
}