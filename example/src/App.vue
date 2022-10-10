<template>
  <div>
  </div>
</template>

<script lang="ts">
import {Client} from "onebot-client";
export default {
  data(){
    return {}
  },
  async setup(){
    const client=new Client(717505091,'ws://bots.div.icu')
    await client.start()
    // client.sendPrivateMsg(1659488338,'test').then(res=>{
    //   console.log(res)
    // })
    client.pickFriend(1659488338).on('message',(event)=>{
      console.log(event)
    })
    client.pickGroup(626459021).pickMember(1659488338).on('message',event=>{
      console.log(`I'm from group${626459021}:${1659488338}`,event)
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>