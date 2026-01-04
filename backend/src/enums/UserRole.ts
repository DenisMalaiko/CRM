import { UserRole } from "../../generated/prisma";

export enum UserRoleUI {
  Marketer = "Marketer",
  Worker = "Worker"
}

/*
export const UserRoleToPrisma: Record<UserRoleUI, UserRole> = {
  [UserRoleUI.Admin]: UserRole.Admin,
  [UserRoleUI.Marketer]: UserRole.Marketer,
  [UserRoleUI.Worker]: UserRole.Worker,
}*/
