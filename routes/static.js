const express = require('express');
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

// Intentional 500 error route
router.get("/error-test", utilities.handleErrors(errorController.triggerError));

module.exports = router;



