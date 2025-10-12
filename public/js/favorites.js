// filepath: public/js/favorites.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('Favorites.js loaded')
  
  // Handle favorite heart clicks
  document.addEventListener('click', function(e) {
    console.log('Click detected on:', e.target)
    
    if (e.target.closest('.favorite-heart') || e.target.closest('.favorite-btn-small')) {
      e.preventDefault()
      console.log('Favorite heart clicked!')
      const button = e.target.closest('.favorite-heart') || e.target.closest('.favorite-btn-small')
      const invId = button.dataset.invId
      console.log('Vehicle ID:', invId)
      
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
  console.log('toggleFavorite called with invId:', invId)
  try {
    console.log('Making fetch request to /favorites/toggle')
    const response = await fetch('/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ inv_id: invId })
    })
    
    console.log('Response received:', response.status)
    const result = await response.json()
    console.log('Result:', result)
    
    if (result.success) {
      // Update heart appearance
      if (result.isFavorite) {
        button.classList.add('favorited')
        button.title = 'Remove from favorites'
        // Change to filled heart
        const heartIcon = button.querySelector('.heart-icon')
        if (heartIcon) {
          heartIcon.textContent = '♥'
        }
      } else {
        button.classList.remove('favorited')
        button.title = 'Add to favorites'
        // Change to outline heart
        const heartIcon = button.querySelector('.heart-icon')
        if (heartIcon) {
          heartIcon.textContent = '♡'
        }
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
      const favoritesList = document.querySelector('#favorites-list')
      if (favoritesList && favoritesList.children.length === 0) {
        document.querySelector('#favorites-display').innerHTML = '<p class="no-favorites">You haven\'t added any vehicles to your favorites yet. <a href="/inv/browse">Browse vehicles</a> to find vehicles you love!</p>'
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
  const hearts = document.querySelectorAll('.favorite-heart, .favorite-btn-small')
  
  for (const heart of hearts) {
    const invId = heart.dataset.invId
    
    try {
      const response = await fetch(`/favorites/check/${invId}`)
      const result = await response.json()
      
      if (result.isFavorite) {
        heart.classList.add('favorited')
        heart.title = 'Remove from favorites'
        // Change to filled heart
        const heartIcon = heart.querySelector('.heart-icon')
        if (heartIcon) {
          heartIcon.textContent = '♥'
        }
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