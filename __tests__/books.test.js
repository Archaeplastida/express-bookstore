process.env.NODE_ENV = "test" //overrides .env

const request = require("supertest"), app = require("../app"), db = require("../db");

let bookIsbn;

beforeEach(async () => {
    let result = await db.query(`INSERT INTO books (isbn, amazon_url,author,language,pages,publisher,title,year) VALUES( '7983247938', 'https://abookstore.com/a-real-book', 'Test Person', 'English', 999, 'A test publisher', 'A test book', 1999) RETURNING isbn`);
    bookIsbn = result.rows[0].isbn
});

afterEach(async () => await db.query("DELETE FROM books"));

afterAll(async () => await db.end());

describe("POST /books", () => {
    test("Creation of a new book.", async () => {
        const response = await request(app).post("/books").send({ isbn: '9874329823', amazon_url: "https://anewbookyeahh.org", author: "Test Person the II", language: "Nonsense", pages: 9999, publisher: "a random tester", title: "The Concept Of Nonsense", year: 2024 });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    })

    test("Doesn't allow the creation if properties are missing.", async () => {
        const response = await request(app).post("/books").send({ isbn: '9937429832', year: 9999, author: "This will not work!" });
        expect(response.statusCode).toBe(400);
    })
})

describe("PUT /books/:isbn", () => {
    test("Updates a book.", async () => {
        const response = await request(app).put(`/books/${bookIsbn}`).send({ amazon_url: 'https://abookstore.com/a-real-book', author: "I'm the author now!", language: "English", pages: 999, publisher: "I'm the publisher now.", title: "A test book", year: 1999 });
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.author).toBe("I'm the author now!");
        expect(response.body.book.publisher).toBe("I'm the publisher now.");
    })

    test("Doesn't allow the attempt of an ISBN change.", async () => {
        const response = await request(app).put(`/books/${bookIsbn}`).send({ isbn: "2938539283", amazon_url: 'https://abookstore.com/a-real-book', author: "I'm the author now!", language: "English", pages: 999, publisher: "I'm the publisher now.", title: "A test book", year: 1999 });
        expect(response.statusCode).toBe(401);
    })
})

describe("GET /books", () => {
    test("Gets a list, containing a single book.", async () => {
        const response = await request(app).get("/books"), books = response.body.books, properties = ["isbn", "amazon_url", "author", "language", "pages", "publisher", "title", "year"];
        expect(books).toHaveLength(1);
        for (let property of properties) expect(books[0]).toHaveProperty(property);
    })
})

describe("GET /books/:isbn", () => {
    test("Gets a book by isbn.", async () => {
        const response = await request(app).get(`/books/${bookIsbn}`), book = response.body.book, properties = ["isbn", "amazon_url", "author", "language", "pages", "publisher", "title", "year"];
        for (let property of properties) expect(book).toHaveProperty(property);
    })

    test("Responds 404 if ISBN isn't found.", async () => {
        const response = await request(app).get("/books/293858");
        expect(response.statusCode).toBe(404);
    })
})

describe("DELETE /books/:isbn", () => {
    test("Deletes a book by isbn.", async () => {
        const response = await request(app).delete(`/books/${bookIsbn}`);
        expect(response.body).toEqual({ message: "Book deleted" });
    })

    test("Responds 404 if ISBN isn't found.", async () => {
        const response = await request(app).delete("/books/293858");
        expect(response.statusCode).toBe(404);
    })
})