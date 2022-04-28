require('dotenv').config()

const server = require('./api/server')

const PORT = process.env.PORT || 8080

server.listen(PORT, () =>{
	console.log('server running on port 8080')
})