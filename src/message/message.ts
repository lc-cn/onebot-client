import {Client} from "onebot-client/client";
import {MessageElem, Quotable, Sendable} from "onebot-client/message/elements";
import {GroupMessageEvent, MessageRet, PrivateMessageEvent} from "onebot-client/event";
import {} from "onebot-client/group";
import {Gender, GroupRole} from "onebot-client/common";

export function genDmMessageId(uid: number, seq: number, rand: number, time: number, flag = 0) {
    const buf = Buffer.allocUnsafe(17)
    buf.writeUInt32BE(uid)
    buf.writeInt32BE(seq & 0xffffffff, 4)
    buf.writeInt32BE(rand & 0xffffffff, 8)
    buf.writeUInt32BE(time, 12)
    buf.writeUInt8(flag, 16) //接收为0 发送为1
    return buf.toString("base64")
}
export abstract class Message{
    post_type = "message" as "message"
    message_id = ""
    constructor(public c:Client,private $json:Record<string, any>) {
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
        return this.$json
    }
}
export class PrivateMessage extends Message{
    message_type = "private" as "private"
    /** friend:好友 group:群临时会话 self:我的设备 other:其他途径的临时会话 */
    sub_type = "friend" as "friend" | "group" | "other" | "self"
    sender = {
        user_id: 0,
        nickname: "",
        group_id: undefined as number | undefined,
        discuss_id: undefined as number | undefined,
    }
    constructor(c:Client,message:Record<string, any>) {
        super(c,message);
        let opposite = this.from_id, flag = 0
        if (this.from_id === c.uin)
            opposite = this.to_id, flag = 1
        this.message_id = genDmMessageId(opposite, this.seq, this.rand, this.time, flag)
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


    /** 消息时间 */
    time: number
    /** 消息元素数组 */
    message: MessageElem[]
    /** 字符串形式的消息 */
    raw_message: string
    font: string
    /** 消息编号，在群消息中是唯一的 (私聊消息建议至少使用time,seq,rand中的两个判断唯一性) */
    seq: number
    /** 消息随机数 */
    rand: number
    sender?: {[k: string]: any}

    /** 引用回复 */
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
    /** 是否可以匿名发言 */
    enable: boolean
    flag: string
    id: number
    id2: number
    name: string
    expire_time: number
    color: string
}