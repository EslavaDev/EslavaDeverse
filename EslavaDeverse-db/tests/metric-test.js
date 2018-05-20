'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging: function () {}
}

let MetricStub = null
let uuid = 'yyy-yyy-yyy'
let type = 'CPU'
let AgentStub = null
let uuidArgs = {
  where: { uuid }
}
let metricUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}
let typeUuidArgs = {
  attributes: [ 'id', 'type', 'value', 'createdAt' ],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  incluede: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}
let newMetric = {
  type: 'GPU',
  agentId: 1,
  value: '100%'
}
let db = null
let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  MetricStub = {
    belongsTo: sinon.spy()
  }
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))
  metricUuidArgs.include[0].model = AgentStub
  typeUuidArgs.incluede[0].model = AgentStub

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  AgentStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid))
  AgentStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric services should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), ' Arguments should be the Model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), ' Arguments should be the Model')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)
  t.true(AgentStub.findOne.called, 'Agent findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'Agent findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with specified args')

  t.deepEqual(metric, newMetric, 'agent should be the same')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)
  t.true(MetricStub.findAll.called, 'findByUuid should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findByUuid should be called once')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findByUuid should be called with')
  t.deepEqual(metric, metricFixtures.findByAgentUuid(uuid), 'should be the same')
})
test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid()
  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with')
  t.deepEqual(metric, metricFixtures.findByTypeAgentUuid(type, uuid), 'should be the same')
})
