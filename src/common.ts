/** 性别 */
export type Gender = "male" | "female" | "unknown"
export interface Profile{
    nickname:string
    company:string
    email:string
    college:string
    personal_note:string
}
export interface StrangerInfo{
    user_id:number
    nickname:string
    sex:'male'|'female'|'unknown'
    age:number
    qid:string
    level:number
    login_days:number
}
export interface GroupHonorInfo{
    group_id:number
    current_talkative:TalkActive
    talkative_list:MemberHonorInfo[]
    performer_list:MemberHonorInfo[]
    legend_list:MemberHonorInfo[]
    strong_newbie_list:MemberHonorInfo[]
    emotion_list:MemberHonorInfo[]
}
export interface MemberHonorInfo{
    user_id:number
    nickname:string
    avatar:string
    description:string
}
export interface VersionInfo{
    app_name:string
    app_version:string
    app_full_name:string
    protocol_version:string
    coolq_edition?:string
    coolq_directory?:string
    version?:string
    runtime_os?:string
    runtime_version?:string
    protool?:number
}
export interface TalkActive{
    user_id:number
    nickname:string
    avatar:string
    day_count:number
}
/** 群内权限 */
export type GroupRole = "owner" | "admin" | "member"
export type PushStrToNextStr<S extends string,NS extends string>=NS extends `${infer L}.${infer R}`?`${L}.${S}.${R}`:`${NS}.${S}`
