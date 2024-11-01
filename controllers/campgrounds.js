const Campground = require('../models/campgrounds')

module.exports.index=async (req, res) => {//-> '/campgrounds' ye waala jo hai wo url me hota hai
    const campgrounds = await Campground.find({});
    //res.render('campgrounds/index') here i just grabbed it
    res.render('campgrounds/index', { campgrounds })//grabbed + rendered
}

module.exports.renderNewForm=(req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground =async (req, res) => {
    //if (!req.body.campground) throw new ExpressError('invalid campground data', 400)
    //this is not a mongoose schema but a schema meant for validation in the server side
    const campground = new Campground(req.body.campground)//kyunki agar html form ko dhyaan se dekhega to assume karega ki apan saara data campground[] me rakha hai
    campground.author=req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    // basicaly we r saying that that we are populating all the reviews from the review array on the one campground
    //then for each review populate the author of that particular review
    //then at the end, populate the author of tha campground seperately
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: { path: 'author' }  // Populate each review's author field
    })
    .populate('author');  // Populate the campground's author field directly

    
    console.log("Campground data:", campground); // Check populated data

    if (!campground) {
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id);
    if (!campground) { //if campgroung not found flash this error mssg
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground=async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//spread operator
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground=async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
}