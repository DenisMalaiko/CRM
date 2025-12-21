import { MessageRoles } from 'prisma-client-0650b02a02e507ba4cbed796f9b27df37f09faff1e3a420a9969c52fff291492';

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
