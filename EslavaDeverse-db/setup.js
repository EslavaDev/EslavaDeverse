'use strict'
const debug = require('debug')('EslavaDeverse:db:setup')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')
const config = require('./config-db')({secure: true})

const prompt = inquirer.createPromptModule()

async function setup () {
  let flag = false
  process.argv.map(m => {
    if (m === '--yes' || m === '--y') {
      flag = true
    } else {
      flag = false
    }
  })
  if (!flag) {
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
  }

  await db(config).catch(handleFatalError)
  debug('Success')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
