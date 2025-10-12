const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ********************************
 * Constructs the nav HTML unordered list
*********************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassificationsWithVehicles()
    let list = "<ul>"
    list += '<li><a href="/" title="Home Page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail
      +'" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '<button type="button" class="favorite-btn-small" data-inv-id="' + vehicle.inv_id + '">❤️</button>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the browse all vehicles view HTML
* ************************************ */
Util.buildBrowseGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="browse-display">'
    data.forEach(vehicle => { 
      grid += '<li class="browse-item">'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_image
      +'" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<p class="classification-tag">' + vehicle.classification_name + '</p>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '<button type="button" class="favorite-btn-small" data-inv-id="' + vehicle.inv_id + '">❤️</button>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no vehicles could be found.</p>'
  }
  return grid
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* **************************************
* THIS IS STEP # 4, I added this!
Build the vehicle detail HTML
* ************************************ */
Util.buildDetailView = function(vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle details not found.</p>';
  }
  let html = `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <ul>
        <li><strong>Make:</strong> ${vehicle.inv_make}</li>
        <li><strong>Model:</strong> ${vehicle.inv_model}</li>
        <li><strong>Year:</strong> ${vehicle.inv_year}</li>
        <li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</li>
        <li><strong>Description:</strong> ${vehicle.inv_description}</li>
        <li><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</li>
        <li><strong>Color:</strong> ${vehicle.inv_color}</li>
      </ul>
    </div>
  `;
  return html;
};

/* **************************************
* Build the vehicle detail HTML
* Used by invController.buildByInventoryId
* ************************************ */
Util.buildVehicleDetail = function(vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle details not found.</p>';
  }
  let html = `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
        <p class="description">${vehicle.inv_description}</p>
        <div class="vehicle-specs">
          <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        </div>
        <div class="favorite-action">
          <button type="button" id="favoriteBtn" class="favorite-btn" data-inv-id="${vehicle.inv_id}">
            <span id="favoriteText">❤️ Add to Favorites</span>
          </button>
        </div>
      </div>
    </div>
  `;
  return html;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
* WK05 - Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 * WK05 Assignment Middleware to check account type 
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin) {
    // Check if account type is Employee or Admin
    if (res.locals.accountData.account_type === "Employee" || 
        res.locals.accountData.account_type === "Admin") {
      next(); // Allow access
    } else {
      req.flash("notice", "You do not have permission to access this resource. Employee or Admin access required.");
      return res.redirect("/account/login");
    }
  } else {
    req.flash("notice", "Please log in with an Employee or Admin account to access this resource.");
    return res.redirect("/account/login");
  }
};




/* ****************************************
 * WK05 assignment Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


/* **************************************
* Build favorites grid HTML
* ************************************ */
Util.buildFavoritesGrid = async function(favorites) {
  let grid = '<ul id="favorites-display">'
  
  favorites.forEach(vehicle => {
    grid += '<li class="favorite-item">'
    grid += `<div class="favorite-image">
               <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                 <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
               </a>
             </div>`
    grid += '<div class="favorite-info">'
    grid += `<h3><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h3>`
    grid += `<span class="favorite-price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`
    grid += `<p class="favorite-added">Added: ${new Date(vehicle.date_added).toLocaleDateString()}</p>`
    grid += `<div class="favorite-actions">
               <a href="/inv/detail/${vehicle.inv_id}" class="view-details">View Details</a>
               <button class="remove-favorite" data-inv-id="${vehicle.inv_id}">Remove</button>
             </div>`
    grid += '</div>'
    grid += '</li>'
  })
  
  grid += '</ul>'
  return grid
}

/* **************************************
* Check if vehicle is user's favorite
* ************************************ */
Util.checkFavoriteStatus = async function(account_id, inv_id) {
  if (!account_id || !inv_id) return false
  
  const favoritesModel = require("../models/favorites-model")
  return await favoritesModel.isFavorite(account_id, inv_id)
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data, account_id = null){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      
      // Add favorite heart if user is logged in
      if (account_id) {
        grid += `<button class="favorite-heart" data-inv-id="${vehicle.inv_id}" title="Add to favorites">
                   <i class="fas fa-heart"></i>
                 </button>`
      }
      
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>`
      grid += '</h2>'
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

module.exports = Util 