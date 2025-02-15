const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const expressError=require("../utils/expressError.js");
const { listingSchema , reviewSchema }=require("../schema.js");
const Listing=require("../models/listings.js");
const Review=require("../models/reviews.js");


const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg) ;
      }else{
        next();
    }
};


//Reviews route
//post route
router.post("/",validateReview, wrapAsync(async (req, res) => {
    let {id}=req.params;
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.reviews);

    listing.reviews.push(newReview);
    await newReview.save(); 
    await listing.save(); 
    req.flash("success","New Review Created");
    console.log("New review added");
    res.redirect(`/listings/${id}`);
}));

//delete route for reviews
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
    
}));

module.exports=router;