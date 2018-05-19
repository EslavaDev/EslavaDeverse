'use strict'
const debug = require('debug')('EslavaDeverse:db:setup')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Sequelize = require('sequelize')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }
  ])

  if (!answer.setup) {
    return console.log('Nothing happened :)')
  }
  const config = {
    database: process.env.DB_NAME || 'eslavadeverse',
    username: process.env.DB_USER || 'wolfy',
    password: process.env.DB_PASS || 'eslava',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: s => debug(s),
    setup: true,
    operatorsAliases: Sequelize.Op
  }

  await db(config).catch(handleFatalError)
  console.log('Success')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
