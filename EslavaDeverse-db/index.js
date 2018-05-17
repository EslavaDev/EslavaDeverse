'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')

module.exports = async (config) => {
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
  sequelize.sync()

  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
