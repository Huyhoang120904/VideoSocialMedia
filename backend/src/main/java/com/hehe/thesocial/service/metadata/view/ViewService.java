package com.hehe.thesocial.service.metadata.view;

import com.hehe.thesocial.dto.response.metadata.ViewResponse;

public interface ViewService {

    /**
     * Increase view count for a feed item and update the user's watched list.
     *
     * @param feedItemId   ID of the feed item being viewed
     * @param userDetailId ID of the viewing user
     * @return ViewResponse with updated viewsCount and watched status
     */
    ViewResponse addView(String feedItemId, String userDetailId);
}


