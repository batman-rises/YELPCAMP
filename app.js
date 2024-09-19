const express = require('express');
const app = express();
const path = require('path')

const methodOverride = require('method-override')

//requiring and connecting MONGOOSE
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/yelp-camp';//yelp-camp is name of DB

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });
/*mongoose.connect(dbUrl, {
    useNewUrlParser: true,      these all shits are now there by default
    useUnifiedTopology: true,
})*/


const Campground = require('./models/campgrounds')

//requiring EJS-MATE
const ejsMate = require('ejs-mate');



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//to execute EJS smoothly we need these two lines

app.use(express.urlencoded({ extended: true }));//parsing through url/ie tempating

app.use(methodOverride('_method'));

app.engine('ejs', ejsMate);


app.get('/', (req, res) => {
    //res.send('hello from yelp camp')
    res.render('home')
})
/*app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'backyard', description: 'cheap very cheap' })
    await camp.save();
    res.send(camp);
})*/


//Campground is the name of the model

//campground INDEX:-
app.get('/campgrounds', async (req, res) => {//-> '/campgrounds' ye waala jo hai wo url me hota hai
    const campgrounds = await Campground.find({});
    //res.render('campgrounds/index') here i just grabbed it
    res.render('campgrounds/index', { campgrounds })//grabbed + rendered
})
//Campground New & Create   ~~~order does matter

/**The GET /campgrounds/new route shows a form to create a new campground.
The POST /campgrounds route handles form submissions, creates a new campground using the submitted data, 
saves it to the database, and then redirects the user to the details page of the newly created campground. */
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground)//kyunki agar html form ko dhyaan se dekhega to assume karega ki apan saara data campground[] me rakha hai
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})
//Campground SHOW~details pg for each camp
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})
//Campground Edit & Update
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//spread operator
    res.redirect(`/campgrounds/${campground._id}`)
})
//Campground Delete
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})


app.listen(3000, () => {
    console.log("listening on port 3000")
})