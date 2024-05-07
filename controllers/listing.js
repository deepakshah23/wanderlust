const Listing = require("../models/listing");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});

module.exports.index=async (req,res)=>{
    const alllistings=await Listing.find({});
    res.render("listings/index.ejs",{alllistings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate(
        {path:"reviews",populate:{
        path:"author"
    },
}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}
module.exports.createListing=async (req,res,next)=>{
    // let {title, description, image, price, location, country}=req.body;
    // let listing=req.body.listing;
    // console.log(listing)
    
    // server error handling
    // let {result}=listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400,result.error);
    // }

    // if(!req.body.listings){
    //     throw new ExpressError(400,"send valid data for listing")
    // }
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
    //    console.log(response.body.feature[0].geometry);
    //    res.send("done!");

        let url=req.file.path;
        let filename=req.file.filename;
        // console.log(url,"...",filename)
        const newlisting=new Listing(req.body.listing);
        // await newlisting.save().then(()=>{
        // console.log("sample was saved");
        // })
        newlisting.owner=req.user._id;
        newlisting.image={url, filename};

        newlisting.geometry=response.body.features[0].geometry;

        let savedListing=await newlisting.save();
        console.log(savedListing);
        req.flash("sucess","New Listing Created!");
        res.redirect("/listings");
}
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    // console.log(list);
    if(!list){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=list.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{list,originalImageUrl});
}
module.exports.updateListing=async (req,res)=>{
    // if(!req.body.listings){
        //     throw new ExpressError(400,"send valid data for listing")
        // }
        let {id}=req.params;
       let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});

       if(typeof req.file !=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url, filename};
        await listing.save();
       }
        req.flash("sucess","Listing updated!");
    res.redirect(`/listings/${id}`);
    // console.log(updatelisting);
}
module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedlisting=await Listing.findByIdAndDelete(id);
    // console.log(deletedlisting);
    req.flash("sucess","Listing deleted!");
    res.redirect("/listings");
}