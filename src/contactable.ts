import {EventDeliver} from "event-deliver";
import {Client} from "./client";

export class Contactable extends EventDeliver{
    protected user_id?:number
    protected group_id?:number
    constructor(public c:Client) {
        super();
    }
    get client(){
        return this.c
    }
    em(name:string,data:any){
        data = Object.defineProperty(data || { }, "self_id", {
            value: this.c.uin,
            writable: true,
            enumerable: true,
            configurable: true,
        })
        while (true) {
            this.emit(name, data)
            let i = name.lastIndexOf(".")
            if (i === -1)
                break
            name = name.slice(0, i)
        }
    }
}