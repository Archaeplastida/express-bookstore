const request = require("supertest"), app = require("../app"), db = require("../db");

process.env.NODE_ENV = "test" //overrides .env

let bookIsbn;

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO books (isbn, amazon_url,author,language,pages,publisher,title,year) VALUES( '7983247938', 'https://abookstore.com/a-real-book', 'Test Person', 'English', 999, 'A test publisher', 'A test book', 1999) RETURNING isbn`);
    bookIsbn = result.rows[0].isbn
});
