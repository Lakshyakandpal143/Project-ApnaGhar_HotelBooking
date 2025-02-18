const Listing = require("../models/listings.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.newListing = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listings);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!list) {
        req.flash("error", "The listing you are searching for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing you are searching for does not exist");
        res.redirect("/listings");
    }
    req.flash("success", "Listing Edited");
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listings });
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};