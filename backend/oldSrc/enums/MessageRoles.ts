import { MessageRoles } from '../../generated/prisma';

export enum MessageRolesUI {
  Assistant = "Assistant",
  User = "User",
  Client = "Client",
}

export const MessageRolesToPrisma: Record<MessageRolesUI, MessageRoles> = {
  [MessageRolesUI.Assistant]: MessageRoles.Assistant,
  [MessageRolesUI.User]: MessageRoles.User,
  [MessageRolesUI.Client]: MessageRoles.Client,
}
