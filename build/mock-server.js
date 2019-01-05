var path = require('path')
var express = require('express')
// var cors = require('cors')
var mockjs = require('express-mockjs')

var app = express()
const port = 3000
const host = 'localhost'

app.use(express.static(path.join(__dirname, 'public')))

// Using the default path /
var mockDir = path.join(process.cwd(), 'mocks')
console.log(mockDir)
app.use(mockjs(mockDir))

// or custom path /api
app.use('/api', mockjs(mockDir))

// Add your middleware here, etc.
// app.use(cors())

app.listen(port)
// console.log('mock Api前缀：' + '无')
console.log('listening at http://' + host + ':' + port)
