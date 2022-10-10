import {Contactable} from "onebot-client/contactable";
import {Client} from "onebot-client/client";
import {Gender} from "onebot-client/common";
import {EventDeliver} from "event-deliver";
import {
    PrivateMessageEvent,
    FriendRequestEvent, FriendIncreaseEvent, FriendDecreaseEvent, FriendRecallEvent, FriendPokeEvent
} from "onebot-client/event";

export class User extends Contactable{
    constructor(c:Client,public readonly uid:number) {
        super(c);
    }
    static as(this: Client, uid: number) {
        return new User(this, Number(uid))
    }
    asFriend(){
        return this.c.pickFriend(this.uid)
    }
    asMember(gid:number){
        return this.c.pickMember(gid,this.uid)
    }
}
export interface UserInfo {
    user_id: number
    nickname: string
}
export interface FriendInfo extends UserInfo{
    sex: Gender
    remark: string
    class_id: number
}
export interface PrivateMessageEventMap{
    'message'(event:PrivateMessageEvent):void
    'message.friend'(event:PrivateMessageEvent):void
    'message.group'(event:PrivateMessageEvent):void
    'message.other'(event:PrivateMessageEvent):void
    'message.self'(event:PrivateMessageEvent):void
}
export interface FriendNoticeEventMap{
    'notice'(event:FriendIncreaseEvent | FriendDecreaseEvent | FriendRecallEvent | FriendPokeEvent):void
    'notice.increase'(event:FriendIncreaseEvent):void
    'notice.decrease'(event:FriendDecreaseEvent):void
    'notice.recall'(event:FriendRecallEvent):void
    'notice.poke'(event:FriendPokeEvent):void
}
export interface FriendRequestEventMap{
    'request'(event:FriendRequestEvent):void
    'request.add'(event:FriendRequestEvent):void
    'request.single'(event:FriendRequestEvent):void
}
export interface FriendEventMap extends PrivateMessageEventMap,FriendNoticeEventMap,FriendRequestEventMap{
}

export class Friend extends Contactable{
    public info:FriendInfo
    constructor(c:Client,uid:number) {
        super(c);
        this.user_id=uid
        this.info=c.fl.get(this.user_id) as FriendInfo
    }
    static as(this:Client,uid:number){
        return new Friend(this,uid)
    }
}
export interface Friend{

    on<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],prepend?:boolean):EventDeliver.Dispose
    on<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener:(...args:any)=>any,prepend?:boolean):EventDeliver.Dispose
    addEventListener<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addEventListener<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener:(...args:any)=>any,prepend?:boolean):EventDeliver.Dispose
    prependEventListener<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],append?:boolean):EventDeliver.Dispose
    prependEventListener<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener:(...args:any)=>any,append?:boolean):EventDeliver.Dispose
    once<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],prepend?:boolean):EventDeliver.Dispose
    once<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener:(...args:any)=>any,prepend?:boolean):EventDeliver.Dispose
    addOnceEventListener<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addOnceEventListener<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener:(...args:any)=>any,prepend?:boolean):EventDeliver.Dispose
    prependOnceEventListener<E extends keyof FriendEventMap>(event:E,listener:FriendEventMap[E],append?:boolean):EventDeliver.Dispose
    off<E extends keyof FriendEventMap>(event?:E,listener?:FriendEventMap[E]):boolean
    off<S extends string|symbol>(event?:S & Exclude<S, keyof FriendEventMap>,listener?:(...args:any)=>any):boolean
    removeEventListener<E extends keyof FriendEventMap>(event:E,listener?:FriendEventMap[E]):EventDeliver.Dispose
    removeEventListener<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,listener?:(...args:any)=>any):EventDeliver.Dispose
    emit<E extends keyof FriendEventMap>(event:E,...args:FriendEventMap[E] extends ((...args: infer P) => any) ? P : never[]):boolean
    emit<S extends string|symbol>(event:S & Exclude<S, keyof FriendEventMap>,...args:Parameters<(...args:any)=>any>):boolean
}