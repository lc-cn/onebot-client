import {EventDeliver} from "event-deliver";

export class Link extends EventDeliver{
    private ws?:WebSocket
    constructor(private endpoint:string) {
        super();
        this.handleMessage=this.handleMessage.bind(this)
        this.handleError=this.handleError.bind(this)
        this.handleClose=this.handleClose.bind(this)
    }
    callApi<T extends any=any>(action:string,params?:Record<string, any>){
        const echo=new Date().getTime()
        return new Promise<T>((resolve,reject) => {
            const dispose=this.on('data',(data)=>{
                if(data.echo===echo){
                    dispose()
                    if(data.status==='success'){
                        resolve(data.data)
                    }else{
                        reject(data.error)
                    }
                }
            })
            this.send({action,params,echo})
        })
    }
    connect(){
        return new Promise<void>((resolve, reject) => {
            this.ws=new WebSocket(this.endpoint)
            this.ws.onopen=()=>{
                resolve()
            }
            this.ws.onmessage=this.handleMessage
            this.ws.onerror=this.handleError
            this.ws.onclose=this.handleClose
        })
    }
    private handleMessage(event:MessageEvent){
        this.emit('data',JSON.parse(event.data.toString()))
    }
    private handleError(event:Event){
        this.emit('error',event)
    }
    private handleClose(event:CloseEvent){
        this.emit('close',event)
    }
    send(data:Record<string, any>){
        this.ws?.send(JSON.stringify(data))
    }
    dispose(){
        if(this.ws){
            this.ws.close()
        }
    }
}