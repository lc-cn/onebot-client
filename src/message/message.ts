import {Client} from "../client";
import {MessageElem, Quotable, Sendable} from "./elements";
import {GroupMessageEvent, MessageRet, PrivateMessageEvent} from "../event";
import {} from "../group";
import {Gender, GroupRole} from "../common";
import {Contactable} from "../contactable";

export abstract class Message{
    post_type = "message" as "message"
    message_id = ""
    constructor(public c:Client,$json:Record<string, any>) {
        Object.assign(this,$json)
    }
    static from<T extends keyof MessageEventMap>(this:Client,type:T,message:Record<string, any>):MessageEventMap[T]{
        let result:PrivateMessage | GroupMessage=type==='private'?new PrivateMessage(this,message):new GroupMessage(this,message)
        switch (type){
            case "group":
                result
                const gME=result as GroupMessageEvent
                gME.group=this.pickGroup(gME.group_id)
                gME.member=this.pickMember(gME.group_id,gME.user_id)
                gME.recall=function (){
                    return this.c.link.callApi('recall_msg',{message_id:this.message_id})
                }
                break;
            case "private":
                const pME=result as PrivateMessageEvent
                pME.friend=this.pickUser(pME.user_id).asFriend()
        }
        result.message_type=type
        result.reply=async function (message:Sendable,quote?:boolean){
            const target:Record<string, any>={}
            switch (this.message_type){
                case "private":
                    target.user_id=this.user_id
                    break;
                case "group":
                    target.group_id=(this as MessageEventMap['group']).group_id
                    break;
            }
            Object.assign(target,{
                message,
                quote:quote?this.toJSON():undefined,
                message_type:this.message_type
            })
            return await this.c.link.callApi('send_msg',target)
        }
        return result as MessageEventMap[T]
    }
    toJSON(){
        return Object.fromEntries(Object.keys(this)
            .filter((key:keyof Message)=>{
                return typeof this[key] !=='function' && !(this[key] instanceof Contactable)
            })
            .map((key:keyof Message)=>[key,this[key]])
        )
    }
}
export class PrivateMessage extends Message{
    message_type = "private" as "private"
    /** friend:?????? group:??????????????? self:???????????? other:??????????????????????????? */
    sub_type = "friend" as "friend" | "group" | "other" | "self"
    sender = {
        user_id: 0,
        nickname: "",
        group_id: undefined as number | undefined,
        discuss_id: undefined as number | undefined,
    }
    constructor(c:Client,message:Record<string, any>) {
        super(c,message);
    }
}
export class GroupMessage extends Message{
    message_type = "group" as "group"
    sender = {
        user_id: 0,
        nickname: "",
        card: "",
        sex: "unknown" as Gender,
        age: 0,
        area: "",
        level: 0,
        role: "member" as GroupRole,
        title: ""
    }
    constructor(c:Client,message:Record<string, any>) {
        super(c,message);
    }
}
export interface Message{
    message_type:'discuss'|'group'|'private'
    user_id: number


    /** ???????????? */
    time: number
    /** ?????????????????? */
    message: MessageElem[]
    /** ???????????????????????? */
    raw_message: string
    font: string
    /** ?????????????????????????????????????????? (??????????????????????????????time,seq,rand???????????????????????????) */
    seq: number
    /** ??????????????? */
    rand: number
    sender?: {[k: string]: any}

    /** ???????????? */
    source?: Quotable

    pktnum: number
    index: number
    div: number
    cqCode:string
    reply(message:Sendable,quote?:boolean):Promise<MessageRet>
}
export interface PrivateMessage{
    from_id: number
    to_id: number
    auto_reply: boolean
}
export interface GroupMessage{

    sub_type: "normal" | "anonymous"
    group_id: number
    group_name: string
    anonymous: Anonymous | null
    block: boolean
    atme: boolean
    atall: boolean
}
interface MessageEventMap{
    group:GroupMessageEvent
    private:PrivateMessageEvent
}
export interface Anonymous {
    /** ???????????????????????? */
    enable: boolean
    flag: string
    id: number
    id2: number
    name: string
    expire_time: number
    color: string
}