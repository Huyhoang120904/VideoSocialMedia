import { api } from './HttpClient';

export interface UserDetail {
    id: string;
    displayName?: string;
    shownName?: string;
    bio?: string;
    avatarUrl?: string;
    followingCount?: number;
    followerCount?: number;
}

class UserService {
    /**
     * Lấy thông tin user hiện tại (từ JWT token)
     * @returns UserDetail của user đang đăng nhập
     */
    async getMyDetail(): Promise<UserDetail> {
        const response = await api.get('/user-details/me');
        const result = response.data.result || response.data;

        // Map avatar từ FileDocument nếu có
        const avatarUrl = result.avatar?.url || result.avatar?.secureUrl || null;

        return {
            id: result.id,
            displayName: result.displayName,
            shownName: result.shownName,
            bio: result.bio,
            avatarUrl: avatarUrl,
            followingCount: result.followingCount,
            followerCount: result.followerCount,
        };
    }

    /**
     * Lấy thông tin user theo ID
     * @param userDetailId - ID của user cần lấy thông tin
     */
    async getUserDetailById(userDetailId: string): Promise<UserDetail> {
        const response = await api.get(`/user-details/${userDetailId}`);
        const result = response.data.result || response.data;

        const avatarUrl = result.avatar?.url || result.avatar?.secureUrl || null;

        return {
            id: result.id,
            displayName: result.displayName,
            shownName: result.shownName,
            bio: result.bio,
            avatarUrl: avatarUrl,
            followingCount: result.followingCount,
            followerCount: result.followerCount,
        };
    }
}

export default new UserService();
