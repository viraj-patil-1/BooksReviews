const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require("express-session")
const regd_users = express.Router();

let users = {};

regd_users.use(session({ secret: "fingerprint", resave: true, saveUninitialized: true }))

const isValid = (username) => {
    return users.hasOwnProperty(username);
}

const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
}

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(users)
    if (!username || !password) {
        return res.status(400).json({ message: "Username and Password are required!" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).json({ message: "Loged in Successfully!" });
    } else {
        return res.status(401).json({ message: "Invalid Username or Password!" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Unauthorized. Please login to add or modify a review." });
    }

    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added / updated successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Unauthorized. Please login to delete a review." });
    }

    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;