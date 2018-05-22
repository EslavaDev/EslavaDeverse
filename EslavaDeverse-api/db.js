const debug = require('debug')('eslavadeverse:api:db')
const express = require('express')
const asyncify = require('express-asyncify')
const db = require('eslavadeverse-db')
const config = db.configG()

const api = asyncify(express.Router())

 


    
module.exports= async () => { 
    var services, Agent, Metric
  if(!services) {
    try{
    services = await db(config)
    }catch(e){
      return next(e)
    }
     Metric = services.Metric
    Agent = services.Agent
  }


  
  
} 



