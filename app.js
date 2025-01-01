const express = require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listings.js");
const path=require("path");
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

//index route
app.get("/listings",async(req,res)=>{
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//create route
app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listings);
    newListing.save();
    res.redirect("/listings");
})

//show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    res.render("listings/show.ejs",{list});
});

//Edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id",async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listings});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    console.log("deleted");
    res.redirect("/listings");
});



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

app.listen(8080,()=>{
    console.log("app is listening");
});