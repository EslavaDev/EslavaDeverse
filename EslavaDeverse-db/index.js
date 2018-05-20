'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')
const defaults = require('defaults')

module.exports = async (config) => {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 1000
    },
    query: {
      raw: true
    },
    operatorsAliases: false
  })
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // --------RELACIONES CON SEQUALIZE------------//

  AgentModel.hasMany(MetricModel) // el 1 tiene muchos del 2
  MetricModel.belongsTo(AgentModel) // el 1 pertenece a 2

  // --------FIN DE RELACION SEQUALIZE-----------//

  // para validad que la base de datos esta bien configurada
  await sequelize.authenticate()

  // configuraciond e la base de datos
  if (config.setup) {
    await sequelize.sync({force: true})
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
