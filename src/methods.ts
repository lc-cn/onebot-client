import {FriendInfo, UserInfo} from "onebot-client/friend";
import {GroupInfo, MemberInfo} from "onebot-client/group";
import {Client} from "onebot-client/client";
import {Message, Quotable, Sendable} from "onebot-client/message";
import {MessageRet} from "onebot-client/event";

type Bot={
    self:Client.Self
    online:boolean
}
export interface Api {
    login(params:{password?:string}):void
    /** 发送 */
    send_private_msg(params:{user_id:number,message:Sendable,source?:Quotable}):MessageRet
    send_group_msg(params:{group_id:number,message:Sendable,source?:Quotable}):MessageRet
    send_discuss_msg(params:{discuss_id:number,message:Sendable,source?:Quotable}):MessageRet
    delete_friend(params:{friend_id:number}):boolean
    send_guild_msg(params:{guild_id:string,channel_id:string,message:Sendable,source?:Quotable}):MessageRet
    get_status():{good:boolean,bots:Bot[]}
    get_friend_list():FriendInfo[]
    get_friend_info(params:{user_id:number}):FriendInfo
    get_group_list():GroupInfo[]
    get_group_info(params:{group_id:number}):GroupInfo
    get_stranger_info(params:{user_id:number}):UserInfo[]
    get_group_member_list(params:{group_id:number}):MemberInfo[]
    get_group_member_info(params:{group_id:number,user_id:number}):MemberInfo
    set_group_kick(params:{group_id:number,user_id:number,reject_add_request?:boolean}):void
    set_group_ban(params:{group_id:number,user_id:number,duration?:number}):void
    set_group_anonymous_ban(params:{group_id:number,flag:string,duration?:number}):void
    set_group_admin(params:{group_id:number,user_id:number,enable?:boolean}):void
    set_group_card(params:{group_id:number,user_id:number,card?:string}):void
    set_group_name(params:{group_id:number,group_name:string}):void
    set_group_leave(params:{group_id:number,is_dismiss?:boolean}):void
    set_group_special_title(params:{group_id:number,user_id:number,special_title?:string, duration?:number}):void
    // set_friend_add_request(params:{flag:string,approve?:boolean,remark?:string}):void
    // set_group_add_request(params:{flag:string,type:'add'|'invite',approve?:boolean,reason?:string}):void
    send_group_sign(params:{group_id:number}):void
    set_group_whole_ban(params:{group_id:number,enable?:boolean}):void
    delete_msg(params:{message_id:string}):void
    get_msg(params:{message_id:string}):Omit<Message, 'reply'>
}
