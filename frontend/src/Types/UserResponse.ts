import { RoleResponse } from "./RoleResponse";

export type UserResponse = {
  id: string;
  username: string;
  mail: string;
  roles: RoleResponse[];
};
