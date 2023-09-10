// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

// Set up database connection, create a test invoice for each test, clean up after each test
beforeEach(async () => {
    const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', 100) RETURNING *`);
    testInvoice = result.rows[0];
});

afterEach(async () => {
    await db.query('DELETE FROM invoices');
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", function () {
    test("Gets a list of invoices", async function () {
        const resp = await request(app).get('/invoices');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ invoices: [testInvoice] });
    });
});

// describe("GET /invoices/:id", function () {
//     test("Gets a single invoice", async function () {
//         const resp = await request(app).get(`/invoices/${testInvoice.id}`);
//         expect(resp.statusCode).toBe(200);
//         expect(resp.body).toEqual({ invoice: testInvoice });
//     });

//     test("Responds with 404 for invalid invoice id", async function () {
//         const resp = await request(app).get('/invoices/0'); 
//         expect(resp.statusCode).toBe(404);
//     });
// });

// describe("POST /invoices", function () {
//     test("Creates a new invoice", async function () {
//         const newInvoice = { comp_code: 'new', amt: 200 };
//         const resp = await request(app).post('/invoices').send(newInvoice);
//         expect(resp.statusCode).toBe(201);
//         expect(resp.body).toEqual({ invoice: { id: expect.any(Number), add_date: expect.any(String), ...newInvoice } });
//     });
// });

// describe("PUT /invoices/:id", function () {
//     test("Updates an invoice", async function () {
//         const updateInvoice = { amt: 200, paid: true };
//         const resp = await request(app).put(`/invoices/${testInvoice.id}`).send(updateInvoice);
//         expect(resp.statusCode).toBe(200);
//         expect(resp.body).toEqual({ invoice: { ...testInvoice, amt: 200, paid: true, paid_date: expect.any(String) } });
//     });

//     test("Responds with 404 for invalid invoice id", async function () {
//         const resp = await request(app).put('/invoices/0').send({ amt: 200, paid: true }); 
//         expect(resp.statusCode).toBe(404);
//     });
// });
