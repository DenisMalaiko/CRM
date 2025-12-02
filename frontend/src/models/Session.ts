import { TBaseModel } from "./BaseModel";
import { TUser } from "./User";
import { TMessage } from "./Message";

export type TSession = TBaseModel & {
  userId: string;
  user: TUser;
  message: TMessage[];
  createdAt: Date;
}