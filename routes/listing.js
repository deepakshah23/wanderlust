const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js")
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage });


router.route("/")
.get(
    wrapAsync(listingController.index)
)
.post(
isLoggedIn,
upload.single('listing[image]'),
validateListing,
wrapAsync(listingController.createListing)
);
// .post(upload.single('listing[image]'),(req,res)=>{
//     res.send(req.file);
// })


// index route
// router.get("/",
// wrapAsync(listingController.index)
// );

// create new
router.get("/new",
isLoggedIn,
listingController.renderNewForm)

// router.post("/",
// validateListing,
// wrapAsync(listingController.createListing)
// );


router.route("/:id")
.get(
wrapAsync(listingController.showListing)
)
.put(
isLoggedIn,
isOwner,
upload.single('listing[image]'),
validateListing,
wrapAsync(listingController.updateListing)
)
.delete(
isLoggedIn,
isOwner,
wrapAsync(listingController.destroyListing)
)
// show route
// router.get("/:id",
// wrapAsync(listingController.showListing)
// );

// update route or edit
router.get("/:id/edit",
isLoggedIn,
isOwner,
wrapAsync(listingController.renderEditForm));

// router.put("/:id",
// isLoggedIn,
// isOwner,
// validateListing,
// wrapAsync(listingController.updateListing)
// );

// delete route
// router.delete("/:id",
// isLoggedIn,
// isOwner,
// wrapAsync(listingController.destroyListing)
// );

module.exports=router;
