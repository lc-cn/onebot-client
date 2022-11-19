import {Client} from "onebot-client/client";
import {FriendRequestEvent, GroupInviteEvent, GroupRequestEvent} from "onebot-client/event";
import {Friend} from "onebot-client/friend";
import {json} from "stream/consumers";

export class Request<T extends keyof RequestEventMap,CT extends keyof RequestEventMap[T]>{
    post_type = "request" as "request"
    flag?:string
    constructor(public c:Client,public request_type:T,public sub_type:CT,$json:Record<string, any>) {
        Object.assign(this,$json)
    }
    static from<T extends keyof RequestEventMap,CT extends keyof RequestEventMap[T]>(this:Client,request_type:T,sub_type:CT,event:Record<string, any>){
        if(request_type==='group'){
            return new GroupRequest(this,request_type,sub_type as any,event) as RequestEventMap[T][CT]
        }
        return new FriendRequest(this,request_type,sub_type as any,event) as RequestEventMap[T][CT]
    }
}
export class GroupRequest<T extends keyof RequestEventMap['group']> extends Request<'group', T>{
    constructor(c:Client,request_type:'group',sub_type:T,$json:Record<string, any>) {
        super(c,request_type,sub_type,$json);
    }
    // 快捷处理群邀请/添加请求
    approve(agree?:boolean,reason?:string){
        return this.c.link.callApi<void>('set_group_add_request',{
            flag:this.flag,
            sub_type:this.sub_type,
            approve:agree,
            reason
        })
    }
}
export class FriendRequest<T extends keyof RequestEventMap['friend']> extends Request<'friend', T>{
    constructor(c:Client,request_type:'friend',sub_type:T,$json:Record<string, any>) {
        super(c,request_type,sub_type,$json);
    }
    // 快捷处理好友请求
    approve(agree?:boolean,remark?:string){
        return this.c.link.callApi<void>('set_friend_add_request',{
            flag:this.flag,
            approve:agree,
            remark
        })
    }
}
interface RequestEventMap{
    group:{
        add:GroupRequestEvent
        invite:GroupInviteEvent
    }
    friend:{
        add:FriendRequestEvent
    }
}