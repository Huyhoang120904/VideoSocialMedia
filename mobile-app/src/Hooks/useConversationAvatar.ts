import { useMemo } from "react";
import { getAvatarUrl } from "../Utils/ImageUrlHelper";
import { UserDetailResponse } from "../Types/response/UserDetailResponse";

interface UseConversationAvatarProps {
  params: {
    avatar?: any;
    conversationId?: string;
  };
  currentConversation: any;
  currentUserDetail: UserDetailResponse | null;
  conversationType: string;
}

export const useConversationAvatar = ({
  params,
  currentConversation,
  currentUserDetail,
  conversationType,
}: UseConversationAvatarProps) => {
  const avatarUrl = useMemo(() => {
    // If params has avatar as { uri: ... }, use it
    if (
      params.avatar &&
      typeof params.avatar === "object" &&
      "uri" in params.avatar
    ) {
      return params.avatar.uri;
    }

    // Otherwise, try to get from conversation data
    if (currentConversation) {
      // For direct conversations, get the other user's avatar
      if (
        conversationType === "DIRECT" &&
        currentConversation.userDetails &&
        currentUserDetail
      ) {
        const otherUser = currentConversation.userDetails.find(
          (user) => user.id !== currentUserDetail.id
        );
        if (otherUser?.avatar?.fileName && otherUser.id) {
          return getAvatarUrl(otherUser.id, otherUser.avatar.fileName);
        }
      }
      // For group conversations, use conversation avatar if available
      else if (
        currentConversation.avatar?.fileName &&
        currentConversation.conversationId
      ) {
        return getAvatarUrl(
          currentConversation.conversationId,
          currentConversation.avatar.fileName
        );
      }
    }

    return null;
  }, [params.avatar, currentConversation, currentUserDetail, conversationType]);

  return avatarUrl;
};

