const express = require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError.js");    
const session=require("express-session"); 

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");


const mongo_url="mongodb://127.0.0.1:27017/apnaGhar";



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

const sessionOption={
    secret:"mysecretcode",
    resave:false,
    saveUninitialized:true
};

app.use(session(sessionOption));

app.get("/",(req,res)=>{
    res.send("hi this is root page");
});



app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


app.all("*",(req,res,next)=>{
    next(new expressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    console.log(err);
    let {status=500,message="Something went wrong"}=err;
    res.status(status).render("listings/error.ejs",{err});
});

app.listen(8080,()=>{
    console.log("app is listening");
});