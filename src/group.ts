import {Contactable} from "onebot-client/contactable";
import {Client} from "onebot-client/client";
import {User, UserInfo} from "onebot-client/friend";
import {Gender, GroupRole} from "onebot-client/common";
import {
    GroupAdminEvent,
    GroupInviteEvent,
    GroupMessageEvent, GroupMuteEvent,
    GroupPokeEvent, GroupRecallEvent,
    GroupRequestEvent, GroupTransferEvent, MemberDecreaseEvent,
    MemberIncreaseEvent
} from "onebot-client/event";
import {EventDeliver} from "event-deliver";

const groupCache:WeakMap<GroupInfo,Group>=new WeakMap<GroupInfo, Group>()
const groupMemberCache:WeakMap<MemberInfo,Member>=new WeakMap<MemberInfo, Member>()
export interface GroupMessageEventMap{
    'message'(event:GroupMessageEvent):void
    'message.normal'(event:GroupMessageEvent):void
    'message.anonymous'(event:GroupMessageEvent):void
}
export interface GroupNoticeEventMap{
    'notice'(event:MemberIncreaseEvent | MemberDecreaseEvent | GroupRecallEvent | GroupAdminEvent | GroupMuteEvent | GroupTransferEvent | GroupPokeEvent):void
    'notice.increase'(event:MemberIncreaseEvent):void
    'notice.decrease'(event:MemberDecreaseEvent):void
    'notice.recall'(event:GroupRecallEvent):void
    'notice.admin'(event:GroupAdminEvent):void
    'notice.ban'(event:GroupMuteEvent):void
    'notice.transfer'(event:GroupTransferEvent):void
    'notice.poke'(event:GroupPokeEvent):void
}
export interface GroupRequestEventMap{
    'request'(event:GroupRequestEvent | GroupInviteEvent):void
    'request.add'(event:GroupRequestEvent):void
    'request.invite'(event:GroupInviteEvent):void
}
export interface GroupEventMap extends GroupMessageEventMap,GroupNoticeEventMap,GroupRequestEventMap{
}
export interface MemberEventMap extends GroupEventMap{}
export class Group extends Contactable{
    public members:Map<number,Member>=new Map<number,Member>()
    public info:GroupInfo
    constructor(c:Client,public readonly group_id:number) {
        super(c);
        this.info=c.gl.get(this.group_id) as GroupInfo
        groupCache.set(this.info,this)
        const members=this.c.gml.get(group_id)
        if(members){
            [...members.keys()].forEach(member_id=>{
                this.members.set(member_id,this.pickMember(member_id))
            })
        }
    }
    /** 获取一枚群员实例 */
    pickMember(uid: number) {
        return this.c.pickMember(this.group_id, uid)
    }
    static as(this:Client,group_id:number){
        let groupInfo=this.gl.get(group_id)
        if(groupInfo && groupCache.get(groupInfo)) return groupCache.get(groupInfo) as Group
        const group=new Group(this,group_id)
        groupCache.set(group.info,group)
        return group
    }
}
export interface GroupInfo{
    group_id: number
    group_name: string
    member_count: number
    max_member_count: number
    owner_id: number
    admin_flag: boolean
    last_join_time: number
    last_sent_time?: number
    shutup_time_whole: number
    shutup_time_me: number
    create_time?: number
    grade?: number
    max_admin_count?: number
    active_member_count?: number
    update_time: number
}
export interface MemberInfo extends UserInfo{
    group_id: number
    nickname: string
    sex: Gender
    card: string
    age: number
    area?: string
    join_time: number
    last_sent_time: number
    level: number
    rank?: string
    role: GroupRole
    title: string
    title_expire_time: number
    shutup_time: number
    update_time: number
}
// @ts-ignore
export class Member extends User{
    public group:Group
    public group_id:number
    public user_id:number
    public info:MemberInfo
    constructor(c:Client,gid:number,uid:number) {
        super(c,uid);
        this.group_id=gid
        this.user_id=uid
        this.info=c.gml.get(this.group_id)?.get(this.user_id) as MemberInfo
        groupMemberCache.set(this.info,this)
        this.group=c.pickGroup(gid)
    }
    static as(this:Client,gid:number,uid:number){
        const memberInfo=this.gml.get(gid)?.get(uid)
        if(memberInfo && groupMemberCache.get(memberInfo)) return groupMemberCache.get(memberInfo) as Member
        const member=new Member(this,gid,uid)
        groupMemberCache.set(member.info,member)
        return member
    }
}
export interface Group{
    before<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    on<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    on<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addListener<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependListener<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],append?:boolean):EventDeliver.Dispose
    prependListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    once<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    once<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addOnceListener<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependOnceListener<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],append?:boolean):EventDeliver.Dispose
    prependOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    before<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof GroupEventMap>(event:E,listener:GroupEventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    off<E extends keyof GroupEventMap>(event?:E,listener?:GroupEventMap[E]):boolean
    off<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof GroupEventMap>,listener?:EventDeliver.Listener):boolean
    removeListener<E extends keyof GroupEventMap>(event?:E,listener?:GroupEventMap[E]):boolean
    removeListener<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof GroupEventMap>,listener?:EventDeliver.Listener):boolean
    emit<E extends keyof GroupEventMap>(event:E,...args:GroupEventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emit<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,...args:Parameters<EventDeliver.Listener>):void
    emitSync<E extends keyof GroupEventMap>(event:E,...args:GroupEventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emitSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,...args:Parameters<EventDeliver.Listener>):void
    bail<E extends keyof GroupEventMap>(event:E,...args:GroupEventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bail<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
    bailSync<E extends keyof GroupEventMap>(event:E,...args:GroupEventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bailSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof GroupEventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
}
export interface Member{
    before<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    on<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    on<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addListener<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependListener<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],append?:boolean):EventDeliver.Dispose
    prependListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    once<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    once<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addOnceListener<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    addOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependOnceListener<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],append?:boolean):EventDeliver.Dispose
    prependOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    before<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof MemberEventMap>(event:E,listener:MemberEventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    off<E extends keyof MemberEventMap>(event?:E,listener?:MemberEventMap[E]):boolean
    off<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof MemberEventMap>,listener?:EventDeliver.Listener):boolean
    removeListener<E extends keyof MemberEventMap>(event?:E,listener?:MemberEventMap[E]):boolean
    removeListener<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof MemberEventMap>,listener?:EventDeliver.Listener):boolean
    emit<E extends keyof MemberEventMap>(event:E,...args:MemberEventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emit<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,...args:Parameters<EventDeliver.Listener>):void
    emitSync<E extends keyof MemberEventMap>(event:E,...args:MemberEventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emitSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,...args:Parameters<EventDeliver.Listener>):void
    bail<E extends keyof MemberEventMap>(event:E,...args:MemberEventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bail<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
    bailSync<E extends keyof MemberEventMap>(event:E,...args:MemberEventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bailSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof MemberEventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
}