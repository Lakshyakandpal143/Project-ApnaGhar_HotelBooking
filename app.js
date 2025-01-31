const express = require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listings.js");
const path=require("path");
const wrapAsync=require("./utils/wrapAsync.js");
const expressError=require("./utils/expressError.js");
const { listingSchema , reviewSchema }=require("./schema.js");
const Review=require("./models/reviews.js");


const mongo_url="mongodb://127.0.0.1:27017/apnaGhar";

const methodOverride=require("method-override");

const ejsMate=require("ejs-mate");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); 


main()
    .then(()=>{
        console.log("connected to DB");
    }).catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(mongo_url);
}

app.get("/",(req,res)=>{
    res.send("hi this is root page");
});

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg) ;
      }else{
        next();
    }
};
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg) ;
      }else{
        next();
    }
};

//index route
app.get("/listings",wrapAsync(async(req,res)=>{
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//create route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listings);
    await newListing.save();
    res.redirect("/listings");
}));

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{list});
}));

//Edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res,next)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listings});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews route
//post route
app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req, res) => {
    let {id}=req.params;
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save(); 
    await listing.save(); 

    console.log("New review added");
    res.redirect(`/listings/${id}`);
}));

//delete route for reviews
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
    
}))


// app.get("/testListen",async (req,res)=>{
//     let sample=new Listing({
//         title:"villa",
//         description:"By the beach",
//         price:2000,
//         location:"Calangute, Goa",
//         country:"India",
//     });
//     await sample.save();
//     console.log("sample saved");
//     res.send("Successful testing");
// });

app.all("*",(req,res,next)=>{
    next(new expressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    console.log(err);
    let {status=500,message="Something went wrong"}=err;
    res.status(status).render("listings/error.ejs",{err});
    // res.status(status).send(message);
});

app.listen(8080,()=>{
    console.log("app is listening");
});