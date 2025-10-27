// Helper utilities for creating FormData objects
import { UserDetailUpdateParams } from "../Types/request/UserDetailRequest";

export const createUserDetailUpdateFormData = (
  params: UserDetailUpdateParams
): FormData => {
  const formData = new FormData();

  if (params.displayName !== undefined) {
    formData.append("displayName", params.displayName);
  }

  if (params.bio !== undefined) {
    formData.append("bio", params.bio);
  }

  if (params.shownName !== undefined) {
    formData.append("shownName", params.shownName);
  }

  if (params.avatar) {
    formData.append("avatar", params.avatar);
  }

  return formData;
};
