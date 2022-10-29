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

export class Notice<T extends keyof NoticeEventMap,CT extends keyof NoticeEventMap[T]>{
    post_type = "notice" as "notice"
    constructor(public c:Client,notice_type:T,sub_type:CT,$json:Record<string, any>) {
        Object.assign(this,$json)
    }
    static from<T extends keyof NoticeEventMap,CT extends keyof NoticeEventMap[T]>(this:Client,notice_type:T,sub_type:CT,json:Record<string, any>):NoticeEventMap[T][CT]{
        return new Notice(this,notice_type,sub_type,json) as any
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