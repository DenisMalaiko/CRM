import {UserResponse} from "../../../auth/entities/user.entity";
import {Message} from "./message.entity";

export type Session = {
  id: string;
  agencyId: string;
  userId: string;
  user: UserResponse
  message: Message[];
  createdAt: Date;
}