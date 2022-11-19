import {Contactable} from "onebot-client/contactable";
import {Client} from "onebot-client/client";
import {User, UserInfo} from "onebot-client/friend";
import {Gender, GroupHonorInfo, GroupRole} from "onebot-client/common";
import {
    GroupAdminEvent,
    GroupInviteEvent,
    GroupMessageEvent, GroupMuteEvent,
    GroupPokeEvent, GroupRecallEvent,
    GroupRequestEvent, GroupTransferEvent, MemberDecreaseEvent,
    MemberIncreaseEvent, MessageRet
} from "onebot-client/event";
import {EventDeliver} from "event-deliver";
import {Quotable, Sendable} from "onebot-client/message";
import {GFS} from "onebot-client/fileSystem";

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
    public gfs:GFS
    constructor(c:Client,public readonly group_id:number) {
        super(c);
        groupCache.set(this.info,this)
        this.gfs=new GFS(this)
        const members=this.c.gml.get(group_id)
        if(members){
            [...members.keys()].forEach(member_id=>{
                this.members.set(member_id,this.pickMember(member_id))
            })
        }
    }
    get info(){
        return this.c.gl.get(this.group_id) as GroupInfo
    }
    set info(info){
        this.c.gl.set(this.group_id,info)
    }
    async getInfo(cache?:boolean){
        if(cache) return this.info
        return this.info=await this.client.link.callApi<GroupInfo>('get_group_info',{group_id:this.group_id})
    }
    setAvatar(file:string){
        return this.client.link.callApi<GroupHonorInfo>('set_group_portrait',{group_id:this.group_id,file})
    }
    getHonorInfo(type:'talkative'|'performer'|'legend'|'strong_newbie'|'emotion'|'all'){
        return this.client.link.callApi<GroupHonorInfo>('set_group_kick',{group_id:this.group_id,type})
    }
    /** 获取一枚群员实例 */
    pickMember(uid: number) {
        return this.c.pickMember(this.group_id, uid)
    }
    kickMember(member_id:number,reject_add_request?:boolean){
        return this.client.link.callApi<void>('set_group_kick',{group_id:this.group_id,user_id:member_id,reject_add_request})
    }
    muteMember(member_id:number,duration?:number){
        return this.client.link.callApi<void>('set_group_ban',{group_id:this.group_id,user_id:member_id,duration})
    }
    muteAnonymous(flag:string,duration?:number){
        return this.client.link.callApi<void>('set_group_anonymous_ban',{group_id:this.group_id,flag,duration})
    }
    muteAll(enable?:boolean){
        return this.client.link.callApi<void>('set_group_whole_ban',{group_id:this.group_id,enable})
    }
    setAdmin(member_id:number,enable?:boolean){
        return this.client.link.callApi<void>('set_group_admin',{group_id:this.group_id,user_id:member_id,enable})
    }
    setAnonymous(enable?:boolean){
        return this.client.link.callApi<void>('set_group_anonymous',{group_id:this.group_id,enable})
    }
    setMemberCard(member_id:number,card:string){
        return this.client.link.callApi<void>('set_group_card',{group_id:this.group_id,user_id:member_id,card})
    }
    setName(group_name:string){
        return this.client.link.callApi<void>('set_group_name',{group_id:this.group_id,group_name})
    }
    quit(is_dismiss?:boolean){
        return this.client.link.callApi<void>('set_group_leave',{group_id:this.group_id,is_dismiss})
    }
    setMemberTitle(member_id:number,title:string,duration?:number){
        return this.client.link.callApi<void>('set_group_special_title',{
            group_id:this.group_id,
            user_id:member_id,
            special_title:title,
            duration
        })
    }
    sign(){
        return this.client.link.callApi<void>('send_group_sign',{group_id:this.group_id})
    }
    sendMsg(message:Sendable,quote?:Quotable){
        return this.c.link.callApi<MessageRet>('send_group_msg',{group_id:this.group_id,message,quote})
    }
    static as(this:Client,group_id:number){
        let groupInfo=this.gl.get(group_id)
        if(groupInfo && groupCache.get(groupInfo)) return groupCache.get(groupInfo) as Group
        if(!groupInfo) throw new Error('未找到群：'+group_id)
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
        if(!memberInfo) throw new Error('未找到群成员：'+uid)
        const member=new Member(this,gid,uid)
        groupMemberCache.set(member.info,member)
        return member
    }
    kick(reject_add_request?:boolean){
        return this.group.kickMember(this.user_id,reject_add_request)
    }
    mute(duration?:number){
        return this.group.muteMember(this.user_id,duration)
    }
    setAdmin(enable?:boolean){
        return this.group.setAdmin(this.user_id,enable)
    }
    setCard(card:string){
        return this.group.setMemberCard(this.user_id,card)
    }
    setTitle(title:string,duration?:number){
        return this.group.setMemberTitle(this.user_id,title,duration)
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