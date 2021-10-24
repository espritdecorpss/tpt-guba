const connection = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secrect_token = process.env.TOKEN_KEY

module.exports = {
    async getCategories(req, res) {
        res.status(200).json(await new Promise(resolve => {
            connection.execute(`SELECT * FROM categories`, (err, res) => {
                return resolve(res)
            })
        }))
    },

    async getDashboards(req, res) {
        res.status(200).json(await new Promise(resolve => {
            connection.execute(`SELECT dashboardID,name,email,category,note FROM dashboards INNER JOIN categories USING (categoryID)`, (err, res) => {
                return resolve(res)
            })
        }))
    },

    async AddNewUser(req, res) {
        const { password } = req.body

        const hash = await bcrypt.hash(password, 10)

        connection.execute(`INSERT INTO users (userID, password) VALUES (NULL, '${hash}')`)
        res.status(200)
    },

    async Login(req, res) {
        const { password } = req.query

        const passwords = await new Promise(resolve => {
            connection.execute(`SELECT userID,password FROM users`, (err, res) => {
                return(resolve(res))
            })
        })

        for (let item of passwords) {
            if (await bcrypt.compare(password, item.password)) {
                res.status(200).json({
                    loggedIn: true,
                    token: jwt.sign(item.userID, secrect_token)
                })
                break
            }
        }

        if (!res.finished) {
            res.status(403).json({
                loggedIn: false
            })
        }
    },

    VerifyToken(req, res) {
        const { token } = req.query

        if(token != 'undefined') {
            res.status(200).json({
                loggedIn: true,
                value: jwt.verify(token, secrect_token)
            })
        } else {
            res.status(403).json({
                loggedIn: false
            })
        }
    },

    postDashboard(req, res) {
        const {fullname, email, category, note} = req.body

        connection.execute(`INSERT IGNORE INTO dashboards (name,email,categoryID,note) VALUES('${fullname}','${email}','${category}','${note}')`)
        res.status(200)
    }
}