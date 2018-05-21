'use strict'

const agentFixtures = require('./agent')

const metric = {
  id: 1,
  type: 'CPU',
  value: '20%',
  agent: agentFixtures.byUuid('yyy-yyy-yyy'),
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, {id: 2, type: 'RAM', value: '60%', agent: agentFixtures.byUuid('yyyxx-yyxx-yyyx')}),
  extend(metric, {id: 3, type: 'GPU', value: '40%'}),
  extend(metric, {id: 4, type: 'SSD', agent: agentFixtures.byUuid('yyyxx-yyxx-yyyx')}),
  extend(metric, {id: 5, type: 'HHDD'}),
  extend(metric, {id: 6, type: 'CPU', value: '80%'})
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}
function findByAgentUuid (uuid) {
  return metrics.filter(a => a.agent.uuid === uuid)
    .map(m => {
      const clone = Object.assign({}, m)
      delete clone.id
      delete clone.agent
      delete clone.createdAt
      delete clone.value
      delete clone.updatedAt

      return clone
    })
}

function findByTypeAgentUuid (type, uuid) {
  return metrics.filter(a => a.agent.uuid === uuid && a.type === type)
    .map(m => {
      const clone = Object.assign({}, m)

      delete clone.agent
      delete clone.updatedAt
      return clone
    }).sort(sortBy('createdAt')).reverse()
}

function sortBy (property) {
  return (a, b) => {
    let aProp = a[property]
    let bProp = b[property]

    if (aProp < bProp) {
      return -1
    } else if (aProp > bProp) {
      return 1
    } else {
      return 0
    }
  }
}

module.exports = {
  single: metric,
  all: metrics,
  findByAgentUuid,
  findByTypeAgentUuid
}
