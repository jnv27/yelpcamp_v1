var express      = require('express');
var	router       = express.Router();
var Campground   = require('../models/campgrounds');
var middleware   = require('../middleware');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'chessking', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// var NodeGeocoder = require('node-geocoder');
 
// var options = {
//   provider: 'google',
//   httpAdapter: 'https',
//   apiKey: process.env.GEOCODER_API_KEY,
//   formatter: null
// };
 
// var geocoder = NodeGeocoder(options);

// Index route

router.get("/", function(req, res){
	//eval(require('locus'));
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/index",{camp:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{camp:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});

// router.get("/",function(req,res){
// 		eval(require('locus'));
// 	Campground.find({},function(err,allCamp){
// 		if(err){
// 			req.flash('error','Campground not found');
// 		}
// 		else{
// 			res.render("campgrounds/index",{camp:allCamp,page:'index'});
// 		}
// 	});
// });

// Create Route
router.post("/",middleware.isLoggedin,upload.single('url'),function(req,res){
	// var name = req.body.name;
	// var url = req.body.image;
	// var desc = req.body.description;
	// var cost = req.body.cost;
	// var author ={
	// 	id: req.user._id,
	// 	username: req.user.username
	// };
	// var newCamp = {name: name,url: url,description: desc,author: author,cost: cost};
	// //camp.push(newCamp);
	// Campground.create(newCamp,function(err,campground){
	// 	if(err){
	// 		req.flash('error','Something went wrong!!!');
	// 	}
	// 	else{
	// 		req.flash('success','Successfully created campground');
	// 		res.redirect("/campground");
	// 	}
	// });
	 cloudinary.uploader.upload(req.file.path, function(result) {
	  // add cloudinary url for the image to the campground object under image property
	  req.body.campground.url = result.secure_url;
	  // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
	  // add author to campground
	  req.body.campground.author = {
		id: req.user._id,
		username: req.user.username
	  }
	  Campground.create(req.body.campground, function(err, campground) {
		if (err) {
		  req.flash('error', err.message);
		  return res.redirect('back');
		}
		res.redirect('/campground/' + campground.id);
	  });
	});
});
//CREATE - add new campground to DB
// router.post("/", middleware.isLoggedin, function(req, res){
//   // get data from form and add to campgrounds array
//   var name = req.body.name;
//   var url = req.body.url;
//   var desc = req.body.description;
//   var cost = req.body.cost;
//   var author = {
//       id: req.user._id,
//       username: req.user.username
//   }
//   geocoder.geocode(req.body.location, function (err, data) {
//     if (err || !data.length) {
// 		console.log(err);
// 		console.log(data);
//       req.flash('error', 'Invalid address');
//       return res.redirect('back');
//     }
//     var lat = data[0].latitude;
//     var lng = data[0].longitude;
//     var location = data[0].formattedAddress;
//     var newCampground = {name: name, url: url, description: desc, author:author, location: location, lat: lat, lng: lng,cost: cost};
//     // Create a new campground and save to DB
//     Campground.create(newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err);
// 			req.flash('error','Something went wrong!!!');
//         } else {
//             //redirect back to campgrounds page
//             console.log(newlyCreated);
// 			req.flash('success','Successfully created campground');
//             res.redirect("/campground");
//         }
//     });
//   });
// });

// New form
router.get("/new",middleware.isLoggedin,function(req,res){
	res.render("campgrounds/newcamp");
});

// Show route
router.get("/:id",function(req,res){
	
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
		if(err){
			req.flash('error','Something went wrong');
		}
		else{
			console.log(foundCamp);
			res.render("campgrounds/show",{camp: foundCamp});
		}
	})
	
});

// Edit Campground
router.get('/:id/edit',middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCamp){
		if(err){
			req.flash('error',err);
			res.redirect('/campground');
		}
		else{
			res.render('campgrounds/edit',{camp: foundCamp});
		}
	})
});

// Update router
// router.put('/:id',middleware.checkCampgroundOwnership,function(req,res){
// 	Campground.findByIdAndUpdate(req.params.id,req.body.camp,function(err,updatedCamp){
// 		if(err){
// 			res.redirect('/campground');
// 		}
// 		else{
// 			req.flash('success','Successfully edited campground');
// 			res.redirect('/campground/'+req.params.id);
// 		}
// 	});
// });

router.put("/:id",middleware.checkCampgroundOwnership, upload.single('url'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.url = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.camp.name;
            campground.description = req.body.camp.description;
			campground.cost = req.body.camp.cost;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campground/" + campground._id);
        }
    });
});
// UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//   geocoder.geocode(req.body.location, function (err, data) {
//     if (err || !data.length) {
//       req.flash('error', 'Invalid address');
//       return res.redirect('back');
//     }
//     req.body.campground.lat = data[0].latitude;
//     req.body.campground.lng = data[0].longitude;
//     req.body.campground.location = data[0].formattedAddress;

//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/campground/" + campground._id);
//         }
//     });
//   });
// });

// Destroy route

router.delete('/:id',middleware.checkCampgroundOwnership,function(req,res){
	 Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campground');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;