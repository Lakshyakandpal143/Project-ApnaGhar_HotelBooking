const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

router.route("/")
    //index route
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//new route
router.get("/new", isLoggedIn, listingController.newListing);

router.route("/:id")
    //show route
    .get(wrapAsync(listingController.showListing))
    //update route
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
    //delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));



module.exports = router;