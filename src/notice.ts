import {Client} from "onebot-client/client";
import {
    FriendDecreaseEvent,
    FriendIncreaseEvent,
    FriendPokeEvent,
    FriendRecallEvent,
    GroupAdminEvent,
    GroupInviteEvent,
    GroupMuteEvent,
    GroupPokeEvent,
    GroupRecallEvent,
    GroupTransferEvent,
    MemberDecreaseEvent,
    MemberIncreaseEvent
} from "onebot-client/event";
import {Friend} from "onebot-client/friend";
import {json} from "stream/consumers";
import {Group} from "onebot-client/group";

export class Notice<T extends keyof NoticeEventMap,CT extends keyof NoticeEventMap[T]>{
    post_type = "notice" as "notice"

    constructor(public c:Client,public notice_type:T,public sub_type:CT,$json:Record<string, any>) {
        Object.assign(this,$json)
    }
    static from<T extends keyof NoticeEventMap,CT extends keyof NoticeEventMap[T]>(this:Client,notice_type:T,sub_type:CT,json:Record<string, any>):NoticeEventMap[T][CT]{
        switch (notice_type){
            case "group":{
                return new GroupNotice(this,notice_type,sub_type as any,json) as any
            }
            case "friend":{
                return new FriendNotice(this,notice_type,sub_type as any,json) as any
            }
            default:{
                return new Notice(this,notice_type,sub_type,json) as any
            }
        }
    }
}
export class FriendNotice<T extends keyof NoticeEventMap['friend']> extends Notice<'friend', T>{
    friend:Friend
    constructor(public c:Client,public notice_type:'friend',sub_type:T,$json:Record<string, any>) {
        super(c,notice_type,sub_type,$json);
        this.friend=c.pickFriend($json.user_id)
    }
}
export class GroupNotice<T extends keyof NoticeEventMap['group']> extends Notice<'group', T>{
    group:Group
    constructor(public c:Client,public notice_type:'group',sub_type:T,$json:Record<string, any>) {
        super(c,notice_type,sub_type,$json);
        this.group=c.pickGroup($json.group_id)
    }
}
interface NoticeEventMap{
    friend:{
        increase:FriendIncreaseEvent
        decrease:FriendDecreaseEvent
        recall:FriendRecallEvent
        poke:FriendPokeEvent
    },
    group:{
        increase:MemberIncreaseEvent
        decrease:MemberDecreaseEvent
        recall:GroupRecallEvent
        poke:GroupPokeEvent
        admin:GroupAdminEvent
        ban:GroupMuteEvent
        transfer:GroupTransferEvent
    }
}