process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async function() {
    let result = await db.query
    (`INSERT INTO companies (code, name, description) VALUES ('test', 'TestCompany', 'This is a test company') RETURNING code, name, description`);
    testCompany = result.rows[0];
});

afterEach(async function() {
    await db.query('DELETE FROM companies');
});

afterAll(async function() {
    await db.end();
});

describe("GET /companies", () => {
    test("Gets a list of companies", async () => {
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ companies: [testCompany] });
    });
});

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const resp = await request(app).get(`/${testCompany.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ company: testCompany });
    });

    test("Responds with 404 if can't find company", async () => {
        const resp = await request(app).get('/fakecompany');
        expect(resp.statusCode).toBe(404);
    });
});

describe("POST /", () => {
    test("Creates a new company", async () => {
        const newCompany = { code: 'new', name: 'NewCompany', description: 'This is a new company' };
        const resp = await request(app).post('/').send(newCompany);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ company: newCompany });
    });
});

describe("PUT /:code", () => {
    test("Updates a company", async () => {
        const updates = { name: 'UpdatedCompany', description: 'Updated description' };
        const resp = await request(app).put(`/${testCompany.code}`).send(updates);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ company: { code: testCompany.code, ...updates } });
    });

    test("Responds with 404 if can't find company", async () => {
        const resp = await request(app).put('/fakecompany').send({ name: 'FakeCompany', description: 'Fake description' });
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE /:code", () => {
    test("Deletes a single company", async () => {
        const resp = await request(app).delete(`/${testCompany.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ msg: 'DELETED!' });
    });

    test("Responds with 404 if it can't find company", async () => {
        const resp = await request(app).delete('/fakecompany');
        expect(resp.statusCode).toBe(404);
    });
});

