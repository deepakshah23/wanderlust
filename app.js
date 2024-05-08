if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}
// console.log(process.env.SECREAT); 

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodoverride=require("method-override");
app.use(methodoverride("_method"));
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const session =require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const mongo_url='mongodb://127.0.0.1:27017/wanderlust';
const dbUrl=process.env.ATLASDB_URL;
// app.set()
main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    // await mongoose.connect(mongo_url);
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        // secret:"mysupersecretcode"
        secret:process.env.SECRET,
        
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("error in mongo session store",err);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true, //protect from cross scripting attacks
    },
};

app.get("/",(req,res)=>{
    // res.send("Hi! I am root.")
    res.redirect("/listings");
})


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.sucess=req.flash("sucess");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(res.locals.sucess);
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// middleware error handling
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let { statusCode=500, message="something went wrong!"} =err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    // res.send("something went wrong!");
})

app.listen(8085,()=>{
    console.log("server is listning to port:8085");
})
