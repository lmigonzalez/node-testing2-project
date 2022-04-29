const server = require('./server');
const request = require('supertest');
const db = require('../data/dbConfig');
const Hobbit = require('./hobbits/hobbits-model');

beforeAll(async () => {
    await db.migrate.rollback();  // npx knex migrate:rollback
    await db.migrate.latest();    // npx knex migrate:latest
});

beforeEach(async () => {
    await db('hobbits').truncate();
    await db('hobbits')
        .insert([
            { name: 'Frodo' },
            { name: 'Merry' },
            { name: 'Pippin' },
        ])
});

afterAll(async () => {
    await db.destroy();
});

test('make sure our environment is set correctly', () => {
    expect(process.env.NODE_ENV).toBe('testing');
});

test('server is up', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ api: 'up' });
});

describe('database tests', () => {
    test('getAll', async () => {
        const result = await Hobbit.getAll();
        expect(result.constructor.name).toBe('Array');
        expect(result.length).toBe(3);
        expect(result[1]).toMatchObject({ name: 'Merry' });
    });
    test('insert', async () => {
        let result = await Hobbit.insert({ name: 'Proudfoot' });
        expect(result).toHaveProperty('name', 'Proudfoot');
        expect(result.id).toBe(4);
        result = await Hobbit.getAll();
        expect(result.length).toBe(4);
    });
    test('getById', async () => {
        let result = await Hobbit.getById(0);
        expect(result).not.toBeDefined();
        result = await Hobbit.getById(1);
        expect(result).toBeDefined();
        expect(result.name).toBe('Frodo');
    });
    test('update', async () => {
        let result = await Hobbit.update(3, { name: 'Sam' });
        expect(result).toEqual({ id: 3, name: 'Sam' });
        result = await Hobbit.getAll();
        expect(result).toHaveLength(3);
    });
    test('remove', async () => {
        let result = await Hobbit.remove(1);
        expect(result).toHaveProperty('name', 'Frodo');
        result = await Hobbit.getAll();
        expect(result).toHaveLength(2);
        expect(result[1].id).toBe(3);
    });
});

describe('HTTP API tests', () => {
    test('GET /hobbits', async () => {
        const res = await request(server).get('/hobbits');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });
    test('GET /hobbits/:id', async () => {
        let res = await request(server).get('/hobbits/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'Frodo' });

        res = await request(server).get('/hobbits/100');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Hobbit not found');
    });
    test('POST /hobbits', async () => {
        let res = await request(server).post('/hobbits').send({ name: 'Gaffer' });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: 4, name: 'Gaffer' });

        let result = await Hobbit.getAll();
        expect(result).toHaveLength(4);

        res = await request(server).post('/hobbits').send({});
        expect(res.status).toBe(500);

        result = await Hobbit.getAll();
        expect(result).toHaveLength(4);
    });
    test('DELETE /hobbits/:id', async () => {
        let res = await request(server).delete('/hobbits/2');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 2, name: 'Merry' });

        let result = await Hobbit.getAll();
        expect(result).toHaveLength(2);

        res = await request(server).delete('/hobbits/2');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Hobbit not found');

        result = await Hobbit.getAll();
        expect(result).toHaveLength(2);
    });
    test('PUT /hobbits/:id', async () => {
        let res = await request(server).put('/hobbits/3').send({ name: 'Sleepy' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 3, name: 'Sleepy' });

        let result = await Hobbit.getById(3);
        expect(result).toHaveProperty('name', 'Sleepy');

        result = await Hobbit.getAll();
        expect(result).toHaveLength(3);

        res = await request(server).put('/hobbits/300').send({ name: 'Sleepy' });
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Hobbit not found');

        res = await request(server).put('/hobbits/1').send({ name: null });
        expect(res.status).toBe(500);
    });
});