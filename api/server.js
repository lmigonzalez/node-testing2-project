const express = require('express')
const helmet = require('helmet')

const server = express()
server.use(helmet())
server.use(express.json())



server.get('/', (req, res) =>{
	res.status(200).json({
		status:200,
		message: '/ running'
	})
})

module.exports = server