const db = require('../data/dbConfig')
const request = require('supertest')
const server = require('./server')

const jokes_db = require('./jokes/jokes-data')
const user1 = {
  username:'user1',
  password: '1234'
}

test('sanity', () => {
  expect(true).toBe(false)
})

beforeAll( async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach( async () => {
  await db.seed.run()
})
afterAll( async () => {
  await db.destroy()
})

describe('[POST] /auth/register', () => {

  test('responds with status code 201', async () => {
    const res = await request(server).post('/auth/login').send(user1)
    expect(res.status).toBe(201)
  })

  test('responds with newly created user', () => {
    const res = await request(server).post('auth/login').send(user1)
    const user = await db('users').where("id", 1)
    expect(res.body).toMatchObject(user)
  })
})

describe('[POST] /auth/login', () => {
  test('responds with status code 201', async () => {
    await request(server).post('/auth/register').send(user1)
    const res = await request(server).post('/auth/login').send(user1)
    expect(res.status).toBe(201)
  })

  test('responds with welcome message', () => {
    await request(server).post('/auth/register').send(user1)
    const res = await request(server).post('/auth/login').send(user1)
    expect(res.body).toMatchObject({message: /Welcome back user1/i})
  })
})