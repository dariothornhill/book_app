'use strict';

const { render } = require('ejs');
// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public/styles'));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes

// Testin Route
app.get('/hello', (req, res) => { res.render('pages/index'); });

// Renders the home page
app.get('/', renderHomePage);

// Renders the search form
app.get('/searches/new', showForm);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(info) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

    if (info.imageLinks) {
        let regex = /http/;
        let secureURL = info.imageLinks.thumbnail.replace(regex, 'https');
        this.imgURL = secureURL;
    } else {
        this.imgURL = placeholderImage;
    }

    this.title = info.title || 'No title available'; // shortcircuit
    this.description = info.description || 'No description available';
    this.author = info.authors || 'No author available';

}

// Note that .ejs file extension is not required

function renderHomePage(request, response) {
    response.render('pages/index');
}

function showForm(request, response) {
    response.render('pages/searches/new.ejs');
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    console.log(request.body);
    console.log(request.body.search);


    // can we convert this to ternary?
    (request.body.search[1] === 'title') ? url += `+intitle:${request.body.search[0]}`: console.log("byAuthor");
    (request.body.search[1] === 'author') ? url += `+inauthor:${request.body.search[0]}`: console.log("byTitle");

    superagent.get(url)
        .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
        .then(results => response.render('pages/searches/show', { searchResults: results }))
        .catch(error => {
            // how will we handle errors?
            console.log("Promise Rejection Error Being Handled");
            response.render('pages/error', { errorText: error });
        });

}