import EventDeliver from "event-deliver";
import Websocket from "./websocket";
import {Api} from "onebot-client/methods";
export class Link extends EventDeliver{
    private ws?:typeof Websocket
    #endpoint:string
    #access_token:string
    constructor(options:{endpoint:string,access_token?:string}) {
        super();
        this.#endpoint=options.endpoint
        this.#access_token=options.access_token||''
        this.handleMessage=this.handleMessage.bind(this)
        this.handleError=this.handleError.bind(this)
        this.handleClose=this.handleClose.bind(this)
    }

    callApi<T extends keyof Api>(action:T,...args:Parameters<Api[T]>):Promise<ReturnType<Api[T]>>{
        const params=args.length?Reflect.get(args,0):{}
        const echo=new Date().getTime()
        return new Promise<any>((resolve,reject) => {
            const dispose=this.on('data',(data)=>{
                if(data.echo===echo){
                    dispose()
                    if(data.status==='ok'){
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
            this.ws=new Websocket(this.#endpoint,{
                headers:{
                    ['Authorization']: `Bearer ${this.#access_token}`
                }
            })
            this.ws.onopen=()=>{
                resolve()
            }
            this.ws.onmessage=this.handleMessage
            this.ws.onerror=this.handleError
            this.ws.onclose=this.handleClose
        })
    }
    private handleMessage(event:Record<string, any>){
        this.emit('data',JSON.parse(event.data.toString()))
    }
    private handleError(event:Record<string, any>){
        this.emit('error',event)
    }
    private handleClose(event:Record<string, any>){
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
