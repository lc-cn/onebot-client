let Socket
// @ts-ignore
if(typeof WebSocket!=='undefined') Socket=WebSocket
else Socket=require('ws')
export default Socket