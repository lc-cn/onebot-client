# onebot-client
oneBot 客户端SDK
## Install
```shell
npm i onebot-client
```
## Usage
### 1. linkServer
```javascript
const {Client} = require('onebot-client')
const client=new Client(147258369,{
    remote_url:'ws://localhost:6700',// 你onebot启动时设置的websocket连接地址
    access_token:'',//鉴权token
})
client.start().then(()=>{
    // do sth
})
```
### 2. listen event
```javascript
client.on('message.private',(event)=>{
    event.reply('hello') // listen all private message, reply hello
})
client.pickFriend(22998833).on('message',(event)=>{
    event.reply('hi') // listen friend(22998833) reply hi
})
client.pickGroup(42342342).pickMember(532422).on('message',(event)=>{
    event.recall() // listen group(42342342) member(532422) message, recall that
})
```
### 3. send message
```javascript
client.sendPrivateMsg(22998833,'hello') // send hello to friend 22998833
client.sendGroupMsg(42342342,'hi') // send hi to group 42342342
```
### 4. getClient info
```javascript
client.getGroupList() // 
client.pickGroup(42342342).info // get groupInfo
client.getFriendList() //
client.pickFriend(22998833).info // get friendInfo
client.getGroupMemberList(42342342) // get groupMemberList
client.pickGroup(42342342).pickMember(22998833).info  // get memberInfo
```
### fix request/notice
```javascript
client.on('notice',(notice)=>{
    // fix all notice
})
client.on('request',(notice)=>{
    // fix all request
})
client.pickGroup(42342342).on('notice') // fix group(42342342) notice
client.pickGroup(42342342).on('request') // fix group(42342342) request
client.pickGroup(42342342).on('notice.increase') // fix group(42342342) increase notice
client.pickGroup(42342342).on('request.add') // fix group(42342342) add request
```
## more 
[TypeDocs](https://lc-cn.github.io/onebot-client/)
