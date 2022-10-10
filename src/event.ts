import {GroupMessage, PrivateMessage, Sendable} from "onebot-client/message";
import {Friend, FriendNoticeEventMap, FriendRequestEventMap, PrivateMessageEventMap} from "onebot-client/friend";
import {
    Group,
    GroupMessageEventMap,
    GroupNoticeEventMap,
    GroupRequestEventMap,
    Member,
    MemberInfo
} from "onebot-client/group";
import {Gender, GroupRole, PushStrToNextStr} from "onebot-client/common";
import {EventDeliver} from "event-deliver";

/** 发消息的返回值 */
export interface MessageRet {
    message_id: string
    seq: number
    rand: number
    time: number
}

export interface MessageEvent {
    /**
     * 快速回复
     * @param content 回复消息内容
     * @param quote 引用这条消息(默认false)
     */
    reply(content: Sendable, quote?: boolean): Promise<MessageRet>
}

/** 私聊消息事件 */
export interface PrivateMessageEvent extends PrivateMessage, MessageEvent {
    /** 好友对象 */
    friend: Friend
}
/** 群消息事件 */
export interface GroupMessageEvent extends GroupMessage, MessageEvent {
    /** 快速撤回 */
    recall(): Promise<boolean>
    /** 群对象 */
    group: Group
    /** 发送者群员对象 */
    member: Member
}

export interface RequestEvent {
    post_type: "request"
    user_id: number
    nickname: string
    /** @cqhttp cqhttp方法用 */
    flag: string
    seq: number
    time: number
    /** 快速操作方法 */
    approve(yes?: boolean): Promise<boolean>
}
/** 好友申请 */
export interface FriendRequestEvent extends RequestEvent {
    request_type: "friend"
    /** 为single时对方已将你加为单向好友 */
    sub_type: "add" | "single"
    comment: string
    source: string
    age: number
    sex: Gender
}
/** 群申请 */
export interface GroupRequestEvent extends RequestEvent {
    request_type: "group"
    sub_type: "add"
    group_id: number
    group_name: string
    comment: string
    inviter_id?: number
    tips: string
}
/** 群邀请 */
export interface GroupInviteEvent extends RequestEvent {
    request_type: "group"
    sub_type: "invite"
    group_id: number
    group_name: string
    /** 邀请者在群里的权限 */
    role: GroupRole
}

/** 好友通知共通属性 */
export interface FriendNoticeEvent {
    post_type: "notice"
    notice_type: "friend"
    /** 对方账号 */
    user_id: number
    /** 好友对象 */
    friend: Friend
}
/** 好友增加 */
export interface FriendIncreaseEvent extends FriendNoticeEvent {
    sub_type: "increase"
    nickname: string
}
/** 好友减少 */
export interface FriendDecreaseEvent extends FriendNoticeEvent {
    sub_type: "decrease"
    nickname: string
}
/** 好友消息撤回 */
export interface FriendRecallEvent extends FriendNoticeEvent {
    sub_type: "recall"
    operator_id: number
    /** @cqhttp cqhttp方法用 */
    message_id: string
    seq: number
    rand: number
    time: number
}
/** 好友戳一戳 */
export interface FriendPokeEvent extends FriendNoticeEvent {
    sub_type: "poke"
    operator_id: number
    target_id: number
    action: string
    suffix: string
}

/** 群通知共通属性 */
export interface GroupNoticeEvent {
    post_type: "notice"
    notice_type: "group"
    /** 群号 */
    group_id: number
    /** 群对象 */
    group: Group
}
/** 群员增加 */
export interface MemberIncreaseEvent extends GroupNoticeEvent {
    sub_type: "increase"
    user_id: number
    nickname: string
}
/** 群员减少 */
export interface MemberDecreaseEvent extends GroupNoticeEvent {
    sub_type: "decrease"
    operator_id: number
    user_id: number
    dismiss: boolean
    member?: MemberInfo
}
/** 群消息撤回 */
export interface GroupRecallEvent extends GroupNoticeEvent {
    sub_type: "recall"
    user_id: number
    operator_id: number
    /** @cqhttp cqhttp方法用 */
    message_id: string
    seq: number
    rand: number
    time: number
}
/** 群戳一戳 */
export interface GroupPokeEvent extends GroupNoticeEvent {
    sub_type: "poke"
    /** @deprecated 群中该值永远等于target_id */
    user_id: number
    operator_id: number
    target_id: number
    action: string
    suffix: string
}
/** 管理员变更 */
export interface GroupAdminEvent extends GroupNoticeEvent {
    sub_type: "admin"
    user_id: number
    set: boolean
}
/** 群禁言 */
export interface GroupMuteEvent extends GroupNoticeEvent {
    sub_type: "ban"
    operator_id: number
    user_id: number
    duration: number
    /** 匿名禁言才有此属性 */
    nickname?: string
}
/** 群转让 */
export interface GroupTransferEvent extends GroupNoticeEvent {
    sub_type: "transfer"
    operator_id: number
    user_id: number
}
export type MessageEventMap={
    'message'(event:PrivateMessageEvent|GroupMessageEvent):EventDeliver.Dispose
} & {
    [P in keyof PrivateMessageEventMap as PushStrToNextStr<'private',P>]:PrivateMessageEventMap[P]
} & {
    [P in keyof GroupMessageEventMap as PushStrToNextStr<'group',P>]:GroupMessageEventMap[P]
}
export type NoticeEventMap={
    'notice'(event:Parameters<MergeEventMap['notice.friend']> | Parameters<MergeEventMap['notice.group']> ):EventDeliver.Dispose
} & {
    [P in keyof FriendNoticeEventMap as PushStrToNextStr<'friend',P>]:FriendNoticeEventMap[P]
} & {
    [P in keyof GroupNoticeEventMap as PushStrToNextStr<'group',P>]:GroupNoticeEventMap[P]
}
export type RequestEventMap={
    'request'(event:Parameters<MergeEventMap['request.friend']> | Parameters<MergeEventMap['request.group']> ):EventDeliver.Dispose
} & {
    [P in keyof FriendRequestEventMap as PushStrToNextStr<'friend',P>]:FriendRequestEventMap[P]
} & {
    [P in keyof GroupRequestEventMap as PushStrToNextStr<'group',P>]:GroupRequestEventMap[P]
}
export type MergeEventMap= MessageEventMap & NoticeEventMap & RequestEventMap
export interface EventMap extends MergeEventMap{}