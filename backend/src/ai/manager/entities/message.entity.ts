import { MessageRolesUI } from "../../../enums/MessageRoles";
import { Session } from "./session.entity";

export class Message {
  id: string;
  businessId: string;
  sessionId: string;
  session: Session;
  role: MessageRolesUI;
  message: string;
  createdAt: Date;
}