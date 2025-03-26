const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password };
    return res.status(201).json({ message: "User registered successfully" });
});


public_users.get('/', (req, res) => {
    new Promise((resolve, reject) => {
        resolve(books);
    })
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(500).json({ message: "Error retrieving books", error });
        });
});

public_users.get('/async', async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books", error });
    }
});


public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;

    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    })
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`${baseUrl}/isbn/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found", error: error.message });
    }
});

public_users.get('/author/:author', (req, res) => {
    const { author } = req.params;

    new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found for the given author");
        }
    })
        .then((booksByAuthor) => {
            res.status(200).json(booksByAuthor);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});
public_users.get('/async/author/:author', async (req, res) => {
    const { author } = req.params;

    try {
        const response = await axios.get(`${baseUrl}/author/${author}`);
        if (response.data.length > 0) {
            res.status(200).json(response.data);
        } else {
            throw new Error("No books found for the given author");
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

public_users.get('/title/:title', (req, res) => {
    const { title } = req.params;

    new Promise((resolve, reject) => {
        const bookByTitle = Object.values(books).find(book => book.title === title);
        if (bookByTitle) {
            resolve(bookByTitle);
        } else {
            reject("No book found with the given title");
        }
    })
        .then((bookByTitle) => {
            res.status(200).json(bookByTitle);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});

public_users.get('/async/title/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const response = await axios.get(`${baseUrl}/title/${title}`);
        if (response.data) {
            res.status(200).json(response.data);
        } else {
            throw new Error("No book found with the given title");
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];

    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Reviews not found for this book" });
    }
});

module.exports.general = public_users;