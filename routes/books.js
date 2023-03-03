const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/book');
const Author = require('../models/author');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));   
    }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find();
    if(req.query.title !== null && req.query.title !== '' ) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    //check for published before and after dates
    if(req.query.publishedBefore !== null && req.query.publishedBefore !== '') {
        query = query.lte('publishDate', req.query.publishedBefore);//lte => less than or equal to
    } else if(req.query.publishedAfter !== null && req.query.publishedAfter !== '') {
        query = query.gte('publishDate', req.query.publishedAfter);//gte => greater than or equal to
    }


    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });

    } catch (error) {
        res.redirect('/');
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});


// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        genre: req.body.genre,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });
    console.log(book);
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);

    } catch (error) {
        if(book.coverImageName != null) { 
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

const removeBookCover = (fileName) => {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err);
    });
}

const renderNewPage = async (res, book, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book';
        res.render('books/new', params);
    } catch {
        res.redirect('/books');
    }
}


module.exports = router;