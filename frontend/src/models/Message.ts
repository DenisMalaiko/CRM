import { TBaseModel } from "./BaseModel";
import { TSession } from "./Session";

export type TMessage = TBaseModel & {
  sessionId: string;
  session: TSession;
  message: string;
  createdAt: Date;
}