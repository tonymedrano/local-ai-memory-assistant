export type MemoryType =
    | "decision"
    | "solution"
    | "fact"
    | "preference"
    | "conversation";


export interface MemoryMetadata {

    project?: string;

    type:MemoryType;

    importance:number;

    tags:string[];

    source?:{
        file?:string;
        line?:number;
    };

    createdAt:string;
}



export interface Memory {

    id:string;

    content:string;

    metadata:MemoryMetadata;

}