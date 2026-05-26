const request = require('supertest');
const app = require('../server');

describe('Items API', () => {
  let createdId;

  test('GET /api/items returns object with items and total', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });

  test('POST /api/items creates item', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Test Item', sku: 'WH-9999', quantity: 12, location: 'A2' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Item');
    expect(res.body.sku).toBe('WH-9999');
    expect(res.body.quantity).toBe(12);
    expect(res.body.location).toBe('A2');
    createdId = res.body.id;
  });

  test('PUT /api/items/:id updates item', async () => {
    const res = await request(app).put(`/api/items/${createdId}`).send({ name: 'Updated Item', sku: 'WH-9998', quantity: 8, location: 'B1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Item');
    expect(res.body.sku).toBe('WH-9998');
    expect(res.body.quantity).toBe(8);
    expect(res.body.location).toBe('B1');
  });

  test('DELETE /api/items/:id deletes item', async () => {
    const res = await request(app).delete(`/api/items/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
