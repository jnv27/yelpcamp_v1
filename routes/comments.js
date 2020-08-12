var express    = require('express');
var	router     = express.Router({mergeParams: true});
var Campground = require('../models/campgrounds');
var Comment    = require('../models/comments');
var middleware = require('../middleware');

// Comment form
router.get("/new",middleware.isLoggedin,function(req,res){
	
	Campground.findById(req.params.id,function(err,foundCamp){
		if(err){
			req.flash('error','Something went wrong');
		}
		else{
			res.render('comments/newComment',{camp: foundCamp});
		}
	})
	
});

// Create Comment
router.post("/",middleware.isLoggedin,function(req,res){
	
	Campground.findById(req.params.id,function(err,foundCamp){
		if(err){
			req.flash('error','Something went wrong');
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					foundCamp.comments.push(comment);
					foundCamp.save();
					res.redirect('/campground/'+foundCamp._id);
				}
			})
		}
	})
});

// Edit Route
router.get('/:comment_id/edit',middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			req.flash('error','Something went wrong');
			res.redirect('back');
		}
		else{
			res.render('comments/edit',{camp_id: req.params.id,comment: foundComment});
		}
	})
});

// UPDATE route
router.put('/:comment_id',middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect('back');
		}
		else{
			req.flash('success','Successfully edited comment');
			res.redirect('/campground/'+req.params.id);
		}
	})
});

// DESTROY route

router.delete('/:comment_id',middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err,deletedCommment){
		if(err){
			req.flash('error','Something went wrong');
			res.redirect('back');
		}
		else{
			req.flash('success','Successfully deleted comment');
			res.redirect('/campground/'+ req.params.id);
		}
	});
});

module.exports = router;