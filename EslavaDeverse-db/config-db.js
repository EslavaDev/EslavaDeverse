const debug = require('debug')('eslavadeverse:db:DbConfig')

// Objeto de configuración de la Base de Datos
module.exports = function (init = false) {
  return {
    database: process.env.DB_NAME || 'eslavadeverse', /* Nombre de la DB  */
    username: process.env.DB_USER || 'wolfy',      /* Usuario          */
    password: process.env.DB_PASS || 'eslava',      /* Contraseña       */
    local: process.env.DB_HOST || 'localhost',      /* Dirección IP     */
    dialect: 'mysql', /* Nombre del gestor de DBs a usar en el proyecto */
    logging: s => debug(s),
    setup: init, /* Restauración de la Database */
    operatorsAliases: false
  }
}