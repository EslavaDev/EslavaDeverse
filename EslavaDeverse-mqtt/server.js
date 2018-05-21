'use strict'

const debug = require('debug')('eslavadeverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('eslavadeverse-db')
const conf = db.configG()
const { parsePayload } = require('./util')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

let Agent, Metric

const server = new mosca.Server(settings)

const clients = new Map()

server.on('ready', async () => {
  console.log(`${chalk.blue('[eslavadeverse:mqtt]')} server running`)
  const services = await db(conf).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric
})

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)

  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    // mark agen as disconnected
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      return handleError(err)
    }

    // delete agent from client list
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
  }
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)

      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }
        debug(`Agent ${agent.uuid} saved`)

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Store Metrics
        try {
          await Promise.all(
            payload.metrics.map(metric => Metric.create(agent.uuid, metric))
          )
          // debug(`Metric ${m.id} saved on agent ${agent.uuid}`);
        } catch (err) {
          return handleError(err)
        }
      }
      break
  }
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[error]')}`)
  console.error(err.stack)
}
process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)

module.exports.parsePayload = parsePayload()
