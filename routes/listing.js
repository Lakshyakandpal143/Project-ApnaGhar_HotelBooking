const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const expressError=require("../utils/expressError.js");
const { listingSchema , reviewSchema }=require("../schema.js");
const Listing=require("../models/listings.js");
const {isLoggedIn}=require("../middleware.js");

const validateListing=(req,res,next)=>{
    console.log("Request Body:", req.body);
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg) ;
      }else{
        next();
    }
};

//index route
router.get("/",wrapAsync(async(req,res)=>{
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//create route
router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listings);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
}));

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id).populate("reviews").populate("owner");
    if(!list){
        req.flash("error","The listing you are searching for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{list});
}));

//Edit route
router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","The listing you are searching for does not exist");
        res.redirect("/listings");
    }
    req.flash("success","Listing Edited");
    res.render("listings/edit.ejs",{listing});
}));

//update route
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listings});
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));

module.exports=router;