import { TBaseModel } from "./BaseModel";
import { TSession } from "./Session";
import { MessagesRoles } from "../enum/MessagesRoles";

export type TMessage = TBaseModel & {
  sessionId: string;
  session: TSession;
  role: MessagesRoles;
  message: string;
  createdAt: Date;
}