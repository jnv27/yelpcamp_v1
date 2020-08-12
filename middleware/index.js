var Campground = require('../models/campgrounds');
var Comment = require('../models/comments');
var middleware = {};

middleware.checkCampgroundOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCamp){
			if(err){
				req.flash('error',err.message);
				res.redirect('back');
			}
			else if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){
				next();
			}
			else{
				req.flash('error','Something went wrong');
				res.redirect('back');
			}
		});
	}
	else{
		req.flash('error','You need to login first to do that');
		res.redirect("/login");
	}
}

middleware.checkCommentOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err){
				req.flash('error',err.message);
				res.redirect('back');
			}
			else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
				next();
			}
			else{
				req.flash('error','Something went wrong');
				res.redirect('back');
			}
		});
	}
	else{
		req.flash('error','You need to login first to do that');
		res.redirect("/login");
	}
}

middleware.isLoggedin = function(req,res,next){
	if(req.isAuthenticated()){
		req.flash('success','Successfully logged in');
		return next();
	}
	req.flash('error','Please login first!!!');
	res.redirect('/login');
}

module.exports = middleware;
