import { UserStatus } from "../../generated/prisma";

export enum UserStatusUI {
  Active = "Active",
  Invited = "Invited",
  Disabled = "Disabled",
}

/*
export const UserStatusToPrisma: Record<UserStatusUI, UserStatus> = {
  [UserStatusUI.Active]: UserStatus.Active,
  [UserStatusUI.Invited]: UserStatus.Invited,
  [UserStatusUI.Disabled]: UserStatus.Disabled,
}*/
