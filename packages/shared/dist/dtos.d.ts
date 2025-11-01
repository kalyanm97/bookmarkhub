export interface UserDTO {
    id: string;
    email: string | null;
    username?: string | null;
    displayName?: string | null;
}
export interface BookmarkDTO {
    id: string;
    title: string;
    url: string;
    createdAt: string;
    postedBy?: UserDTO | null;
    upCount?: number;
    downCount?: number;
    userVote?: -1 | 0 | 1;
}
export interface VoteRespDTO {
    upCount: number;
    downCount: number;
    userVote: -1 | 0 | 1;
}
export interface ApiResponse<T> {
    data: T;
}
