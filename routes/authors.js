const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if(req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i'); //case insensitive
    }
    try {
        const authors = await Author.find(searchOptions).sort({name: 'asc'}).limit(20).exec();
        const formattedAuthors = authors.map(author => {
            const formattedDob = new Date(author.dob).toLocaleDateString();
            return {...author.toObject(), dob: formattedDob}
        });        
        res.render('authors/index', {
            authors: formattedAuthors, 
            searchOptions: req.query
        });
    } catch (error) {
        res.redirect('/');
    }
});

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()});
});

// Create Author Route
router.post('/', async (req, res) => {
    const {name, dob, nationality} = req.body;

   try {
        if(!name || !dob || !nationality ){
            throw new Error('All fields are required');
        }
        const author = new Author ({
            name,
            dob,
            nationality
        });
        await author.save();
        // res.redirect(`authors/${newAuthor.id}`);
        res.redirect(`authors`);

   } catch(err) {
        res.render('authors/new', {
            author: req.body,
            errorMessage: 'Error creating Author'
        });
    }
});

module.exports = router;