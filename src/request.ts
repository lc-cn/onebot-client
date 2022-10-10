import {Client} from "onebot-client/client";
import {FriendRequestEvent, GroupInviteEvent, GroupRequestEvent} from "onebot-client/event";

export class Request<T extends keyof RequestEventMap,CT extends keyof RequestEventMap[T]>{
    post_type = "request" as "request"
    constructor(public c:Client,public request_type:T,public sub_type:CT,private $json:Record<string, any>) {
        Object.assign(this,$json)
    }
    static from<T extends keyof RequestEventMap,CT extends keyof RequestEventMap[T]>(this:Client,request_type:T,sub_type:CT,event:Record<string, any>){
        return new Request(this,request_type,sub_type,event) as RequestEventMap[T][CT]
    }
}
interface RequestEventMap{
    group:{
        add:GroupRequestEvent
        invite:GroupInviteEvent
    }
    friend:{
        add:FriendRequestEvent
        single:FriendRequestEvent
    }
}