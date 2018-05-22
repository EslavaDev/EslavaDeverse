'use strict'

const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const api = require('./api')

const port = process.env.PORT || 3000
const app = asyncify(express())
const server = http.createServer(app)

app.use('/api',api)

//Express Error Handler

app.use((err, req, res, next) =>{


    if(err.message.match(/not found/)){
        return res.status(404).send({error: err.message})
    }

    res.status(500).send({error: err.message})
})

function handleFatalError(err){
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
}

if(!module.parent){
    process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)

server.listen(port,() => {
    console.log('server ready in port: ',port)
}) 
}

module.exports = server

