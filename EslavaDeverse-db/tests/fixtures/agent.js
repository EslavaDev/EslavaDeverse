'use strict'

const agent = {
    id:1,
    uuid:'yyy-yyy-yyy',
    name:'fixture',
    username: 'eslava',
    hostname: 'test-hpst',
    pid: 0,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
}

const agents = [
    agent,
    extend(agent, {id:2, uuid:'yyyxx-yyxx-yyyx', connected:false}),
    extend(agent, {id:3, uuid:'aayxx-yyxx-yyyx'}),
    extend(agent, {id:4, uuid:'yyqqx-yyxx-yyyx'}),
    extend(agent, {id:5, uuid:'ffzzx-yyxx-yyyx'}),
    extend(agent, {id:6, uuid:'yyzxx-yyxx-yyyx'})
]

function extend(obj,values){
    const clone = Object.assign({}, obj)
    return Object.assign(clone, values)
}


module.exports = {
   single: agent,
   all: agents,
   connected: agents.filter(a => a.connected),
   eslava: agents.filter(a => a.username == 'eslava'),
   byUuid: id => agents.filter(a => a.uuid == id).shift(),
   byId: id => agents.filter(a => a.id == id).shift()
}