/** 性别 */
export type Gender = "male" | "female" | "unknown"

/** 群内权限 */
export type GroupRole = "owner" | "admin" | "member"
export type PushStrToNextStr<S extends string,NS extends string>=NS extends `${infer L}.${infer R}`?`${L}.${S}.${R}`:`${NS}.${S}`
