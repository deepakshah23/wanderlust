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
   
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()

        let url=req.file.path;
        let filename=req.file.filename;
        // console.log(url,"...",filename)
        const newlisting=new Listing(req.body.listing);
        
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
    
    if(!list){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=list.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{list,originalImageUrl});
}
module.exports.updateListing=async (req,res)=>{
   
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
   
}
module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedlisting=await Listing.findByIdAndDelete(id);
    
    req.flash("sucess","Listing deleted!");
    res.redirect("/listings");
}
