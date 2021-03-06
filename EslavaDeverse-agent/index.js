'use strict'

const debug = require('debug')('eslavadeverse:agent')
const os = require('os')
const mqtt = require('mqtt')
const defaults = require('defaults')
const util = require('util')
const EventEmitter = require('events')
const uuid = require('uuid')
const conf = require('eslavadeverse-mqtt')

const options = {
  name: 'untitled',
  username: 'wolfy',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}
class EslavaDeverseAgent extends EventEmitter {
  constructor (opts) {
    super()

    this._options = defaults(opts, options)
    this._agentId = null
    this._started = false
    this._timer = null
    this._client = null
    this._metrics = new Map()
  }

  addMetric(type, fn){
    this._metrics.set(type, fn)
  }

  removeMetric(type){
    this._metrics.delete(type)
  }


  connect () {
    if (!this._started) {
      const opts = this._options
      this._client = mqtt.connect(opts.mqtt.host)
      this._started = true

      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
          this._agentId = uuid.v4()

        this.emit('connected', this._agentId)
        
        this._timer = setInterval(async () => {
          if(this._metrics.size > 0){
            let message = {
               agent:{
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                host: os.hostname() || 'localhost',
                pid: process.pid
               },
               metrics: [],
               timestamp = new Date().getTime()
            }
          }

          for (let [ metric, fn ] of this._metrics) {
            if (fn.length === 1) {
              fn = util.promisify(fn)
            }

            message.metrics.push({
              type: metric,
              value: await Promise.resolve(fn())
            })
          }

          debug('Sending', message)

          this._client.publish('agent/message', JSON.stringify(message))
          this.emit('message', message)
        }, opts.interval)
      })
      this._client.on('message', (topic, payload) => {
        payload = conf.parsePayload(payload)

        let boradcast = false
        switch (topic){
            case 'agent/connected':
            case 'agent/disconnected':
              debug(`Payload: ${packet.payload}`)
              break
            case 'agent/message':
            boradcast = payload && payload.agent && payload.agent.uuid !== this._agentId
              debug(`Payload: ${packet.payload}`)
              break
        }

        if(boradcast){
          this.emit(topic, payload)
        }
      })

      this._client.on('error', () => this.disconnected())
    }
  }
  disconnected () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }
}

module.exports = EslavaDeverseAgent
