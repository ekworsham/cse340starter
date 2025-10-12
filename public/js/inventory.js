'use strict' 
 
 // Get a list of items in inventory based on the classification_id 
 let classificationList = document.querySelector("#classificationList")
 classificationList.addEventListener("change", function () { 
  let classification_id = classificationList.value 
  console.log(`classification_id is: ${classification_id}`) 
  let classIdURL = "/inv/getInventory/"+classification_id 
  fetch(classIdURL) 
  .then(function (response) { 
   if (response.ok) { 
    return response.json(); 
   } 
   throw Error("Network response was not OK"); 
  }) 
  .then(function (data) { 
   console.log(data); 
   buildInventoryList(data); 
  }) 
  .catch(function (error) { 
   console.log('There was a problem: ', error.message) 
  }) 
 })

 // Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
 let inventoryDisplay = document.getElementById("inventoryDisplay"); 
 // Set up the table labels 
 let dataTable = '<thead>'; 
 dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
 dataTable += '</thead>'; 
 // Set up the table body 
 dataTable += '<tbody>'; 
 // Iterate over all vehicles in the array and put each in a row 
 data.forEach(function (element) { 
  console.log(element.inv_id + ", " + element.inv_model); 
  dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
  dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
  dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
 }) 
 dataTable += '</tbody>'; 
 // Display the contents in the Inventory Management view 
 inventoryDisplay.innerHTML = dataTable; 
}

// Handle favorite button clicks
document.addEventListener('DOMContentLoaded', function() {
  // Handle both detail page and grid favorite buttons
  document.addEventListener('click', function(event) {
    if (event.target.matches('.favorite-btn, .favorite-btn-small')) {
      event.preventDefault();
      
      const invId = event.target.getAttribute('data-inv-id');
      if (!invId) {
        console.error('No inventory ID found');
        return;
      }
      
      toggleFavorite(invId, event.target);
    }
  });
});

async function toggleFavorite(invId, buttonElement) {
  try {
    const response = await fetch('/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inv_id: invId })
    });
    
    // Check if response is a redirect (login required)
    if (response.redirected && response.url.includes('/account/login')) {
      showMessage('Please log in to add favorites.', 'error');
      setTimeout(() => {
        window.location.href = '/account/login';
      }, 2000);
      return;
    }
    
    if (response.ok) {
      const result = await response.json();
      updateFavoriteButton(buttonElement, result.isFavorite);
      
      // Show success message
      showMessage(result.message || 'Favorite updated successfully!', 'success');
    } else if (response.status === 401 || response.status === 403) {
      showMessage('Please log in to add favorites.', 'error');
      setTimeout(() => {
        window.location.href = '/account/login';
      }, 2000);
    } else {
      const error = await response.json().catch(() => ({ message: 'Failed to update favorite' }));
      showMessage(error.message || 'Failed to update favorite', 'error');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

function updateFavoriteButton(buttonElement, isFavorite) {
  if (buttonElement.classList.contains('favorite-btn')) {
    // Detail page button
    const textElement = buttonElement.querySelector('#favoriteText');
    if (textElement) {
      textElement.textContent = isFavorite ? '💔 Remove from Favorites' : '❤️ Add to Favorites';
    }
  } else if (buttonElement.classList.contains('favorite-btn-small')) {
    // Grid button
    buttonElement.textContent = isFavorite ? '💔' : '❤️';
    buttonElement.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
  }
}

function showMessage(message, type) {
  // Create or update a message display element
  let messageDiv = document.querySelector('.flash-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.className = 'flash-message';
    document.body.insertBefore(messageDiv, document.body.firstChild);
  }
  
  messageDiv.className = `flash-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
  
  // Hide message after 3 seconds
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}