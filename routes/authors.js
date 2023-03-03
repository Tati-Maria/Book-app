const express = require('express');
const author = require('../models/author');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

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
        res.redirect(`authors/${author.id}`);

   } catch(err) {
        res.render('authors/new', {
            author: req.body,
            errorMessage: 'Error creating Author'
        });
    }
});

// Show Author Route
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).limit(6).exec();
        const formattedDob = new Date(author.dob).toLocaleDateString();
        const formattedAuthor = {...author.toObject(), dob: formattedDob};
        res.render('authors/show', {author: formattedAuthor, booksByAuthor: books});
    } catch (error) {
        res.redirect('/');
    }
});

// Edit Author Route
router.get('/:id/edit', async (req, res) => {

    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {author: author });
    } catch (error) {
        res.redirect('/authors');
    }
});

// Update Author Route
router.put('/:id', async (req, res) => {
    let author;
    const {id} = req.params;
    try {
        author = await Author.findById(id);
        author.name = req.body.name;
        author.dob = req.body.dob;
        author.nationality = req.body.nationality;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch {
        if(author == null) {
            res.redirect('/');
        } else {
                res.render('authors/edit', {
                    author: author,
                    errorMessage: 'Error updating Author'
                })
        }}
});

// Delete Author Route
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await Author.deleteOne({_id: id});
        res.redirect('/authors');
    } catch(err) {
        res.redirect(`/authors/${id}`);
    }
});

module.exports = router;