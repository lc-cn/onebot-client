import {EventDeliver} from 'event-deliver'
import {Link} from "onebot-client/link";
import {Message} from "onebot-client/message/message";
import {Quotable, Sendable} from "onebot-client/message";
import {Group,Member,MemberInfo, GroupInfo} from "onebot-client/group";
import {Friend, FriendInfo, User} from "onebot-client/friend";
import {EventMap, MessageRet} from "onebot-client/event";
import {Notice} from "onebot-client/notice";
import {Request} from "onebot-client/request";
import {Profile, StrangerInfo, VersionInfo} from "onebot-client/common";

export class Client extends EventDeliver{
    link:Link
    readonly gl=new Map<number, GroupInfo>()
    readonly gml=new Map<number, Map<number, MemberInfo>>()
    readonly fl=new Map<number,FriendInfo>()
    public options:Client.Options/**
     * 得到一个群对象, 通常不会重复创建，调用
     * @param strict 严格模式，若群不存在会抛出异常
     */
    readonly pickGroup = Group.as.bind(this)
    /** 得到一个好友对象, 通常不会重复创建 */
    readonly pickFriend = Friend.as.bind(this)
    /** 得到一个群员对象, 通常不会重复创建 */
    readonly pickMember = Member.as.bind(this)
    /** 创建一个用户对象 */
    readonly pickUser = User.as.bind(this)
    deleteMsg(message_id:string){
        return this.link.callApi('delete_msg',{message_id})
    }
    getInfo(){
        return this.link.callApi<{user_id:number,nickname:string}>('get_login_info')
    }
    setProfile(profile:Partial<Profile>){
        return this.link.callApi<void>('set_qq_profile',profile)
    }
    getStrangerInfo(user_id:number){
        return this.link.callApi<StrangerInfo>('get_stranger_info',{user_id})
    }
    getFriendList(){
        return this.link.callApi<FriendInfo[]>('get_friend_list')
    }
    getGroupList(){
        return this.link.callApi<GroupInfo[]>('get_group_list')
    }
    getGroupMemberList(group_id:number){
        return this.link.callApi<MemberInfo[]>('get_group_member_list',{group_id})
    }
    getMsg(message_id:string){
        return this.link.callApi<Omit<Message, 'reply'>>('get_msg',{message_id})
    }
    getImage(file:string){
        return this.link.callApi<{size:number,filename:string,url:string}>('get_image',{file})
    }
    getRecord(file:string,out_format:'mp3'|'amr'|'wma'|'m4a'|'spx'|'ogg'|'wav'|'flac'='mp3'){
        return this.link.callApi<{file:string}>('get_record',{file})
    }
    canSendImage(){
        return this.link.callApi<{yes:boolean}>('can_send_image')
    }
    canSendRecord(){
        return this.link.callApi<{yes:boolean}>('can_send_record')
    }
    getVersionInfo(){
        return this.link.callApi<VersionInfo>('get_version_info')
    }
    restartServer(){
        return this.link.callApi<void>('set_restart')
    }
    cleanServerCache(){
        return this.link.callApi<void>('clean_cache')
    }
    constructor(public uin:number,options?:Client.Options|string) {
        super();
        if(!options) options='ws://localhost:8080'
        if(typeof options==="string"){
            options={remote_url:options}
        }

        if(!options.remote_url) throw new Error('remote_utl is required')
        this.options=Object.assign({...Client.defaultOptions},options)
        this.link=new Link(`${this.options.remote_url}?access_token=${this.options.access_token}`)
    }
    async start(){
        this.link.on('data',(data)=>{
            if(data.post_type==="meta_event") return
            const {post_type,sub_type}=data
            switch (post_type){
                case "message":{
                    const {message_type,...message}=data
                    const {user_id,group_id}=message
                    const eventName=[post_type,message_type,sub_type]
                        .filter(Boolean)
                        .join('.')
                    const event=Message.from.call(this,message_type,message)
                    if(message_type==='group'){
                        const sumEventName=eventName.replace('.group','')
                        this.pickGroup(group_id).em(sumEventName,event)
                        this.pickGroup(group_id).pickMember(user_id).em(sumEventName,event)
                    }else{
                        const sumEventName=eventName.replace('.private','')
                        this.pickFriend(user_id).em(sumEventName,event)
                    }
                    return this.em(eventName,event)
                }
                case 'notice':{
                    const {notice_type,...notice}=data
                    const {user_id,group_id}=notice
                    const eventName=[post_type,notice_type,sub_type]
                        .filter(Boolean)
                        .join('.')
                    const event=Notice.from.call(this,notice_type,sub_type,notice)
                    if(notice_type==='group'){
                        const sumEventName=eventName.replace('.group','')
                        this.pickGroup(group_id).em(sumEventName,event)
                        this.pickGroup(group_id).pickMember(user_id).em(sumEventName,event)
                    }else{
                        const sumEventName=eventName.replace('.private','')
                        this.pickFriend(user_id).em(sumEventName,event)
                    }
                    return this.em([post_type,notice_type,sub_type]
                        .filter(Boolean)
                        .join('.'),event)
                }
                case 'request':{
                    const {request_type,...request}=data
                    const {user_id,group_id}=request
                    const eventName=[post_type,request_type,sub_type]
                        .filter(Boolean)
                        .join('.')
                    const event=Request.from.call(this,request_type,sub_type,request)
                    if(request_type==='group'){
                        const sumEventName=eventName.replace('.group','')
                        this.pickGroup(group_id).em(sumEventName,event)
                        this.pickGroup(group_id).pickMember(user_id).em(sumEventName,event)
                    }else{
                        const sumEventName=eventName.replace('.private','')
                        this.pickFriend(user_id).em(sumEventName,event)
                    }
                    return this.em([post_type,request_type,sub_type]
                        .filter(Boolean)
                        .join('.'),event)
                }
                case 'system':
                    const {system_type,...system}=data
                    return this.em([post_type,system_type,sub_type]
                        .filter(Boolean)
                        .join('.'),Message.from.call(this,system_type,system))
            }
        })
        await this.link.connect()
        await this.#init()

    }
    async #init(){
        const groupList=await this.getGroupList()
        const friendList=await this.getFriendList()
        for(const groupInfo of groupList){
            this.gl.set(groupInfo.group_id,groupInfo)
            const groupMemberList=await this.getGroupMemberList(groupInfo.group_id)
            const groupMemberMap=new Map<number,MemberInfo>()
            for(const memberInfo of groupMemberList){
                groupMemberMap.set(memberInfo.user_id,memberInfo)
            }
            this.gml.set(groupInfo.group_id,groupMemberMap)
        }
        for(const friendInfo of friendList){
            this.fl.set(friendInfo.user_id,friendInfo)
        }
        console.log(`加载了${this.fl.size}个好友，${this.gl.size}个群`)
    }
    sendPrivateMsg(user_id:number,message:Sendable,source?:Quotable){
        return this.link.callApi<MessageRet>('send_private_msg',{user_id,message,source})
    }
    sendGroupMsg(group_id:number,message:Sendable,source?:Quotable){
        return this.link.callApi<MessageRet>('send_group_msg',{group_id,message,source})
    }
    em(name:string,data:any){
        data = Object.defineProperty(data || { }, "self_id", {
            value: this.uin,
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
    stop(){
        this.link.dispose()
    }
}
export interface AllEventMap extends EventMap,LifeCycle{
}
export interface LifeCycle{
    connect():void
    error(e:Error):void
    close(e:CloseEvent):void
}
export interface Client{
    before<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    on<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    on<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addListener<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    addListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependListener<E extends keyof EventMap>(event:E,listener:EventMap[E],append?:boolean):EventDeliver.Dispose
    prependListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    once<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    once<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    addOnceListener<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    addOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    prependOnceListener<E extends keyof EventMap>(event:E,listener:EventMap[E],append?:boolean):EventDeliver.Dispose
    prependOnceListener<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,append?:boolean):EventDeliver.Dispose
    before<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    before<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    after<E extends keyof EventMap>(event:E,listener:EventMap[E],prepend?:boolean):EventDeliver.Dispose
    after<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,listener:EventDeliver.Listener,prepend?:boolean):EventDeliver.Dispose
    off<E extends keyof EventMap>(event?:E,listener?:EventMap[E]):boolean
    off<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof EventMap>,listener?:EventDeliver.Listener):boolean
    removeListener<E extends keyof EventMap>(event?:E,listener?:EventMap[E]):boolean
    removeListener<S extends EventDeliver.EventName>(event?:S & Exclude<S, keyof EventMap>,listener?:EventDeliver.Listener):boolean
    emit<E extends keyof EventMap>(event:E,...args:EventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emit<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,...args:Parameters<EventDeliver.Listener>):void
    emitSync<E extends keyof EventMap>(event:E,...args:EventMap[E] extends ((...args: infer P) => any) ? P : never[]):void
    emitSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,...args:Parameters<EventDeliver.Listener>):void
    bail<E extends keyof EventMap>(event:E,...args:EventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bail<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
    bailSync<E extends keyof EventMap>(event:E,...args:EventMap[E] extends ((...args: infer P) => any) ? P : never[]):Promise<any>
    bailSync<S extends EventDeliver.EventName>(event:S & Exclude<S, keyof EventMap>,...args:Parameters<EventDeliver.Listener>):Promise<any>
}
export namespace Client{
    export interface Options{
        remote_url:string
        access_token?:string
        reconnect_interval?:number
        max_reconnect_count?:number
    }
    export const defaultOptions:Omit<Options, 'remote_url'>={
        reconnect_interval:3000,
        max_reconnect_count:5
    }
}