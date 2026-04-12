import { User } from "../user/user.model";

export interface RankingResponse{
    maxScore: number;
    attempts: number;
    user: User;
}