import {Group} from "./group";

export class GFS{
    public info:GFS.Info|null=null
    public dirs:Map<string,GFS.Dir>=new Map<string,GFS.Dir>()
    constructor(public group:Group) {
        this.getInfo()
        this.init()
    }
    dir(folder_id:string){
        return this.dirs.get(folder_id)
    }
    async init(){
        const {folders=[]}=await this.ls()
        if(folders.length){
            for(const folder of folders){
                this.dirs.set(folder.folder_id,new GFS.Dir(this,folder.folder_id))
            }
        }
    }
    async getInfo(){
        this.info=await this.group.c.link.callApi<GFS.Info>('get_group_file_system_info',{
            group_id:this.group.group_id
        })
    }
    upload(file:string,name:string,folder?:string){
        return this.group.c.link.callApi<void>('upload_group_file',{
            group_id:this.group.group_id,
            file,
            name:folder
        })
    }
    ls(folder_id?:string){
        if(folder_id) return this.group.c.link.callApi<GFS.DirInfo>('get_group_files_by_folder',{
            group_id:this.group.group_id,
            folder_id
        })
        return this.group.c.link.callApi<GFS.DirInfo>('get_group_root_files',{
            group_id:this.group.group_id,
        })
    }
    mkdir(name:string){
        return this.group.c.link.callApi<void>('create_group_file_folder',{
            group_id:this.group.group_id,
            name,
            parent_id:'/'
        })
    }
    rm(file_id:string,busid?:number){
        if(busid) this.group.c.link.callApi<void>('delete_group_file',{
            group_id:this.group.group_id,
            file_id,
            busid
        })
        return this.group.c.link.callApi<void>('delete_group_folder',{
            group_id:this.group.group_id,
            folder_id:file_id
        })
    }
    createDownloadUrl(file_id:string,busid:number){
        return this.group.c.link.callApi<{url:string}>('get_group_file_url',{
            group_id:this.group.group_id,
            file_id,
            busid
        })
    }

}
export namespace GFS{
    export interface Info{
        file_count:number
        limit_count:number
        used_space:number
        total_space:number
    }
    export class Dir{
        public dirs:Map<string,Dir>=new Map<string,Dir>()
        constructor(public gfs:GFS,public folder_id:string) {
            this.init()
        }
        dir(folder_id:string){
            return this.dirs.get(folder_id)
        }
        async init(){
            const {folders=[]}=await this.ls()
            if(folders.length){
                for(const folder of folders){
                    this.dirs.set(folder.folder_id,new GFS.Dir(this.gfs,folder.folder_id))
                }
            }
        }
        ls(){
            return this.gfs.ls(this.folder_id)
        }
        rm(){
            return this.gfs.rm(this.folder_id)
        }
    }
    export interface DirInfo{
        files:FileInfo[]
        folders:FolderInfo[]
    }
    interface FileInfo{
        group_id:number
        file_id:string
        file_name:string
        busid:number
        file_size:number
        upload_time:number
        dead_time:number
        modify_time:number
        download_times:number
        uploader:number
        uploader_name:string
    }
    interface FolderInfo{
        group_id:number
        folder_id:string
        folder_name:string
        creator:number
        creator_name:string
        total_file_count:number
    }
}