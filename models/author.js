const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    }
});

//constraint to prevent deleting authors with books
authorSchema.pre('deleteOne', async function(next) {
    try {
        const query = this.getFilter();
        const hasBooks = await Book.exists({author: query._id});
        if(hasBooks) {
            next(new Error('Cannot delete author with books'));
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Author', authorSchema);