const router = require('express').Router();
const bcrypt = require('bcryptjs')
const db = require('../../data/dbConfig')

//import token
const tokenBuilder = require('./token-builder')

//import helper middleware
const { userCheck, bodyCheck } = require('./auth-middleware')

//bodyCheck first otherwise it breaks! 
router.post('/register', bodyCheck, userCheck, async (req, res, next) => {
  try {
    let user = req.body

    const rounds = process.env.BCRYPT_ROUNDS || 8
    const hash = bcrypt.hashSync(user.password, rounds)

    user.password = hash

    const new_id = await db('users').insert(user)
    const newUser = await db('users').where("id", new_id)
    res.status(201).json(newUser)
  } catch (err) {
    next(err)
  }
});

router.post('/login', bodyCheck, async (req, res, next) => {
  try {
    let { username, password } = req.body
    const [user] = await db('users').where({username}) 
    if (user && bcrypt.compareSync(password, user.password)){
      const token = tokenBuilder(user)
      res.status(200).json({
        message: `welcome, ${user.username}`,
        token
      })
    } else {
      next({ status: 401, message: 'Invalid credentials'})
    }
  } catch (err) {
    next(err)
  }
});

module.exports = router;
