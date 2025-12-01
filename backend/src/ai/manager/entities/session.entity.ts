import {UserResponse} from "../../../auth/entities/user.entity";

export type Session = {
  id: string;
  userId: string;
  user: UserResponse
  message: string;
  createdAt: Date;
}