'use strict'

const debug = require('debug')('eslavadeverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const db = require('./db')


const api = asyncify(express.Router())


api.get('/agents', (req, res) => {
  debug('A request has come to /agents')
  res.status(200).send({ })
})

let test = db()

console.log(test)

/* api.get('/agent/:uuid', (req, res) => {
  const { uuid } = req.params
  res.status(200).send({ uuid })
}) */
api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /agent/${uuid}`)

  let agent

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}`))
  }

  res.send(agent)
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params
  res.status(200).send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.status(200).send({ uuid, type })
})

module.exports = api
