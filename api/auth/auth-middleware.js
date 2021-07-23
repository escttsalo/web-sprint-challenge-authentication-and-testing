const db = require('../../data/dbConfig')

//checks if the user already exists in db
const userCheck = async (req, res, next) => {
    try{
        const { username } = req.body
        const user = await db('users').where({username})
        if (user.length === 0) {
            next()
        } else {
            next({ status: 401, message: 'username taken'})
        }
    } catch (err) {
        next(err)
    }
}

//checks if the request body is valid
const bodyCheck = (req, res, next) => {
    const { username, password } = req.body
    if (username === undefined || password === undefined){
        next({ status: 422, message: 'username and password are required'})
    }
    next()
}

module.exports = {
    userCheck,
    bodyCheck,
}