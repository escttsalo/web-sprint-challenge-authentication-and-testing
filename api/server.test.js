const db = require('../data/dbConfig')
const request = require('supertest')
const server = require('./server')

const jokes_db = require('./jokes/jokes-data')

const user1 = {
  username:'user1',
  password: '1234'
}

const user2 = {
  username:'user2',
  password: '1234'
}

test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll( async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll( async () => {
  await db.destroy()
})

describe('[POST] /api/auth/register', () => {

  test('responds with status code 201', async () => {
    const res = await request(server).post('/api/auth/register').send(user1)
    expect(res.status).toBe(201)
  })

  test('responds with newly created user', async () => {
    const res = await request(server).post('/api/auth/register').send(user2)
    const user = await db('users').where("id", 2)
    expect(res.body).toMatchObject(user)
  })
})

describe('[POST] /api/auth/login', () => {
  test('responds with status code 201', async () => {
    await request(server).post('/api/auth/register').send(user1)
    const res = await request(server).post('/api/auth/login').send(user1)
    expect(res.status).toBe(200)
  })

  test('responds with welcome message', async () => {
    await request(server).post('/api/auth/register').send(user1)
    const res = await request(server).post('/api/auth/login').send(user1)
    expect(res.body.message).toMatch(/welcome, user1/i)
  })
})

describe('[GET] /api/jokes', () => {
  test('responds with status code 401 unauthenticated user', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch('token required')
  })

  test('responds with jokes array on authenticated user', async () => {
    await request(server).post('/api/auth/register').send(user1)
    let res = await request(server).post('/api/auth/login').send(user1)
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toMatchObject(jokes_db)
  })
})