'use strict'

const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'eslavadeverse',
    username: process.env.DB_USER || 'wolfy',
    password: process.env.DB_PASS || 'eslava',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'xxx',
    name: 'fixture',
    username: 'eslava',
    hostname: 'test-hpst',
    pid: 0,
    connected: true
  }).catch(handleFatalError)

  console.log('--agent')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--agents')
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'CPU',
    value: '40%'
  }).catch(handleFatalError)
  console.log('--metric')
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metrics')
  console.log(metrics)

  const metricsType = await Metric.findByTypeAgentUuid('CPU', agent.uuid).catch(handleFatalError)
  console.log('--metricsType')
  console.log(metricsType)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
