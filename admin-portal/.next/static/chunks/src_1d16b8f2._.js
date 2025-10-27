(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const Toaster = (param)=>{
    let { ...props } = param;
    _s();
    const { theme = "system" } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)"
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sonner.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "EriOrahfenYKDCErPq+L6926Dw4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Toaster;
;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/config/axios.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8082/api/v1") || "http://localhost:8082/api/v1";
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});
// Request interceptor to add auth token
apiClient.interceptors.request.use((config)=>{
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor to handle token refresh
apiClient.interceptors.response.use((response)=>response, async (error)=>{
    var _error_response;
    const originalRequest = error.config;
    if (((_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.status) === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const currentToken = localStorage.getItem("accessToken");
            if (currentToken) {
                console.log("Attempting to refresh token using current access token");
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(API_BASE_URL, "/auth/refresh"), {
                    token: currentToken
                });
                if (response.data.code === 1000 && response.data.result) {
                    const { token: newAccessToken } = response.data.result;
                    localStorage.setItem("accessToken", newAccessToken);
                    // Update the original request with new token
                    originalRequest.headers.Authorization = "Bearer ".concat(newAccessToken);
                    return apiClient(originalRequest);
                } else {
                    throw new Error("Refresh failed: Invalid response");
                }
            } else {
                // No token available, redirect to login
                console.log("No access token available, redirecting to login");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService,
    "userService",
    ()=>userService,
    "videoService",
    ()=>videoService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/axios.tsx [app-client] (ecmascript)");
;
class AuthService {
    async authenticate(request) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/token", request);
        return response.data;
    }
    async introspectToken(request) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/introspect", request);
        return response.data;
    }
    async refreshToken(refreshToken) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/refresh", {
            refreshToken
        });
        return response.data;
    }
    async logout(token) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/logout", {
            token
        });
        return response.data;
    }
}
class UserService {
    async getUsers() {
        let page = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, size = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 12;
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/users?page=".concat(page, "&size=").concat(size));
        return response.data;
    }
    async getUserById(userId) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/users/".concat(userId));
        return response.data;
    }
    async updateUser(userId, userData) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/users/".concat(userId), userData);
        return response.data;
    }
    async deleteUser(userId) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("/users/".concat(userId));
        return response.data;
    }
    async registerUser(request) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/users", request);
        return response.data;
    }
    async updateUserById(userId, request) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/users/".concat(userId), request);
        return response.data;
    }
}
class VideoService {
    async getVideos() {
        let page = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, size = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/videos?page=".concat(page, "&size=").concat(size));
        return response.data;
    }
    async getVideosByUserId(userId) {
        let page = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, size = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/videos/user/".concat(userId, "?page=").concat(page, "&size=").concat(size));
        return response.data;
    }
    async uploadVideo(file, title, description) {
        const formData = new FormData();
        formData.append("file", file);
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/videos/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
    async deleteVideo(videoId) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$axios$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("/videos/".concat(videoId));
        return response.data;
    }
}
const authService = new AuthService();
const userService = new UserService();
const videoService = new VideoService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useAuthStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        user: null,
        accessToken: null,
        loading: false,
        isAuthenticated: false,
        refreshToken: null,
        setUser: (user)=>{
            set({
                user
            });
        },
        setRefreshToken: (token)=>{
            set({
                refreshToken: token
            });
        },
        // Set access token and update axios config
        setAccessToken: (token)=>{
            set({
                accessToken: token,
                isAuthenticated: true
            });
        },
        // Clear authentication
        clearAuth: async ()=>{
            set({
                accessToken: null,
                isAuthenticated: false,
                refreshToken: null,
                user: null
            });
        },
        // Login with username/password
        login: async (username, password)=>{
            try {
                var _response_result, _response_result1, _response_result2;
                console.log("🔐 Login attempt started", {
                    username,
                    passwordLength: password.length,
                    timestamp: new Date().toISOString()
                });
                set({
                    loading: true
                });
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].authenticate({
                    username,
                    password
                });
                console.log("🔐 Login API response", {
                    code: response.code,
                    hasToken: !!((_response_result = response.result) === null || _response_result === void 0 ? void 0 : _response_result.token),
                    tokenPreview: ((_response_result1 = response.result) === null || _response_result1 === void 0 ? void 0 : _response_result1.token) ? "".concat(response.result.token.substring(0, 20), "...") : null,
                    expireAt: (_response_result2 = response.result) === null || _response_result2 === void 0 ? void 0 : _response_result2.expireAt,
                    timestamp: new Date().toISOString()
                });
                if (response.code === 1000 && response.result) {
                    const { token } = response.result;
                    set({
                        accessToken: token,
                        isAuthenticated: true,
                        refreshToken: null
                    });
                    localStorage.setItem("accessToken", token);
                    // Note: Backend doesn't provide refresh token, so we don't store one
                    // Don't set user here - let AuthProvider handle it
                    // This ensures the AuthProvider runs its redirect logic
                    console.log("✅ Login successful, token stored. AuthProvider will handle user loading and redirect.", {
                        tokenPreview: "".concat(token.substring(0, 20), "..."),
                        tokenLength: token.length,
                        timestamp: new Date().toISOString()
                    });
                    // Force a small delay to ensure localStorage is updated and AuthProvider can detect the change
                    setTimeout(()=>{
                        var _localStorage_getItem;
                        console.log("⏰ Login completed, AuthProvider should now detect token and redirect", {
                            localStorageToken: localStorage.getItem("accessToken") ? "".concat((_localStorage_getItem = localStorage.getItem("accessToken")) === null || _localStorage_getItem === void 0 ? void 0 : _localStorage_getItem.substring(0, 20), "...") : null,
                            timestamp: new Date().toISOString()
                        });
                        // Trigger a custom event to notify AuthProvider of token change
                        window.dispatchEvent(new CustomEvent("tokenUpdated", {
                            detail: {
                                token: token
                            }
                        }));
                    }, 100);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Login successful!");
                    return true;
                } else {
                    console.error("❌ Login failed:", {
                        code: response.code,
                        message: response.message,
                        timestamp: new Date().toISOString()
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(response.message || "Invalid credentials");
                    return false;
                }
            } catch (error) {
                var _error_response, _error_response1, _error_response_data, _error_response2;
                console.error("💥 Login error:", {
                    message: error.message,
                    response: (_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.data,
                    status: (_error_response1 = error.response) === null || _error_response1 === void 0 ? void 0 : _error_response1.status,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
                const errorMessage = ((_error_response2 = error.response) === null || _error_response2 === void 0 ? void 0 : (_error_response_data = _error_response2.data) === null || _error_response_data === void 0 ? void 0 : _error_response_data.message) || error.message || "Login failed";
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(errorMessage);
                return false;
            } finally{
                set({
                    loading: false
                });
            }
        },
        // Logout
        logout: async ()=>{
            try {
                const { accessToken } = get();
                if (accessToken) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout(accessToken);
                }
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Logged out successfully!");
                get().clearAuth();
            } catch (error) {
                console.error("Logout error:", error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Logout failed!");
                get().clearAuth();
            }
        }
    }));
const __TURBOPACK__default__export__ = useAuthStore;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/AuthProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuthStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AuthProvider(param) {
    let { children } = param;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { clearAuth, setAccessToken, setUser, user, setRefreshToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const [tokens, setTokens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const accessTokenFromLocal = localStorage.getItem("accessToken") || "";
                const refreshTokenFromLocal = localStorage.getItem("refreshToken") || "";
                console.log("🔄 AuthProvider: Loading tokens from localStorage", {
                    accessToken: accessTokenFromLocal ? "".concat(accessTokenFromLocal.substring(0, 20), "...") : null,
                    refreshToken: refreshTokenFromLocal ? "".concat(refreshTokenFromLocal.substring(0, 20), "...") : null,
                    timestamp: new Date().toISOString()
                });
                setAccessToken(accessTokenFromLocal);
                setRefreshToken(refreshTokenFromLocal);
                setTokens({
                    accessToken: accessTokenFromLocal,
                    refreshToken: refreshTokenFromLocal
                });
            }
        }
    }["AuthProvider.useEffect"], [
        setAccessToken,
        setRefreshToken
    ]);
    // Listen for token updates from login store
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const handleTokenUpdate = {
                "AuthProvider.useEffect.handleTokenUpdate": (e)=>{
                    var _e_detail;
                    const newToken = (_e_detail = e.detail) === null || _e_detail === void 0 ? void 0 : _e_detail.token;
                    if (newToken) {
                        console.log("🔄 AuthProvider: Token updated via custom event", {
                            newToken: newToken ? "".concat(newToken.substring(0, 20), "...") : null,
                            timestamp: new Date().toISOString()
                        });
                        setAccessToken(newToken);
                        setTokens({
                            "AuthProvider.useEffect.handleTokenUpdate": (prev)=>({
                                    accessToken: newToken,
                                    refreshToken: (prev === null || prev === void 0 ? void 0 : prev.refreshToken) || ""
                                })
                        }["AuthProvider.useEffect.handleTokenUpdate"]);
                    }
                }
            }["AuthProvider.useEffect.handleTokenUpdate"];
            window.addEventListener("tokenUpdated", handleTokenUpdate);
            return ({
                "AuthProvider.useEffect": ()=>{
                    window.removeEventListener("tokenUpdated", handleTokenUpdate);
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        setAccessToken
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            var _tokens_accessToken, _localStorage_getItem, _localStorage_getItem1;
            console.log("🔐 AuthProvider useEffect triggered", {
                hasToken: !!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken),
                tokenLength: (tokens === null || tokens === void 0 ? void 0 : (_tokens_accessToken = tokens.accessToken) === null || _tokens_accessToken === void 0 ? void 0 : _tokens_accessToken.length) || 0,
                currentUser: user,
                pathname,
                tokens: tokens ? {
                    accessToken: tokens.accessToken ? "".concat(tokens.accessToken.substring(0, 20), "...") : null,
                    refreshToken: tokens.refreshToken ? "".concat(tokens.refreshToken.substring(0, 20), "...") : null
                } : null,
                localStorage: {
                    accessToken: localStorage.getItem("accessToken") ? "".concat((_localStorage_getItem = localStorage.getItem("accessToken")) === null || _localStorage_getItem === void 0 ? void 0 : _localStorage_getItem.substring(0, 20), "...") : null,
                    refreshToken: localStorage.getItem("refreshToken") ? "".concat((_localStorage_getItem1 = localStorage.getItem("refreshToken")) === null || _localStorage_getItem1 === void 0 ? void 0 : _localStorage_getItem1.substring(0, 20), "...") : null
                }
            });
            const fetchUser = {
                "AuthProvider.useEffect.fetchUser": async ()=>{
                    // Don't fetch if user is already loaded or no token
                    if (user !== null || !(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) {
                        console.log("⏭️ AuthProvider: Skipping fetchUser", {
                            user: user ? {
                                id: user.id,
                                username: user.username,
                                role: user.role
                            } : null,
                            hasToken: !!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken),
                            reason: user !== null ? "User already loaded" : "No access token"
                        });
                        return;
                    }
                    console.log("🔍 AuthProvider: Starting token validation", {
                        hasToken: !!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken),
                        tokenPreview: (tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) ? "".concat(tokens.accessToken.substring(0, 20), "...") : null,
                        currentUser: user,
                        pathname,
                        timestamp: new Date().toISOString()
                    });
                    try {
                        var _introspectResponse_result, _introspectResponse_result1, _introspectResponse_result2, _introspectResponse_result3, _introspectResponse_result4, _introspectResponse_result5;
                        // Validate token
                        const introspectResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].introspectToken({
                            token: tokens.accessToken
                        });
                        console.log("✅ AuthProvider: Token introspection result", {
                            code: introspectResponse.code,
                            isValid: (_introspectResponse_result = introspectResponse.result) === null || _introspectResponse_result === void 0 ? void 0 : _introspectResponse_result.isValid,
                            userId: (_introspectResponse_result1 = introspectResponse.result) === null || _introspectResponse_result1 === void 0 ? void 0 : _introspectResponse_result1.userId,
                            fullResponse: introspectResponse,
                            resultType: typeof ((_introspectResponse_result2 = introspectResponse.result) === null || _introspectResponse_result2 === void 0 ? void 0 : _introspectResponse_result2.isValid),
                            resultValue: (_introspectResponse_result3 = introspectResponse.result) === null || _introspectResponse_result3 === void 0 ? void 0 : _introspectResponse_result3.isValid
                        });
                        if (introspectResponse.code === 1000 && (((_introspectResponse_result4 = introspectResponse.result) === null || _introspectResponse_result4 === void 0 ? void 0 : _introspectResponse_result4.isValid) === true || ((_introspectResponse_result5 = introspectResponse.result) === null || _introspectResponse_result5 === void 0 ? void 0 : _introspectResponse_result5.userId))) {
                            var _userResponse_result_roles;
                            // Get user details using userId from token introspection
                            const userId = introspectResponse.result.userId;
                            if (!userId) {
                                console.log("AuthProvider: No userId in token, clearing auth");
                                localStorage.setItem("accessToken", "");
                                localStorage.setItem("refreshToken", "");
                                clearAuth();
                                if (pathname.startsWith("/admin")) {
                                    router.replace("/login");
                                }
                                return;
                            }
                            const userResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userService"].getUserById(userId);
                            console.log("👤 AuthProvider: User fetch result", {
                                code: userResponse.code,
                                hasUser: !!userResponse.result,
                                userData: userResponse.result ? {
                                    id: userResponse.result.id,
                                    username: userResponse.result.username,
                                    mail: userResponse.result.mail,
                                    roles: (_userResponse_result_roles = userResponse.result.roles) === null || _userResponse_result_roles === void 0 ? void 0 : _userResponse_result_roles.map({
                                        "AuthProvider.useEffect.fetchUser": (r)=>r.name
                                    }["AuthProvider.useEffect.fetchUser"])
                                } : null,
                                fullResponse: userResponse
                            });
                            if (userResponse.code === 1000 && userResponse.result) {
                                var _userData_roles;
                                const userData = userResponse.result;
                                // Check if user account is enabled
                                if (userData.enable === false) {
                                    console.log("🚫 AuthProvider: User account is disabled, clearing auth", {
                                        userId: userData.id,
                                        username: userData.username,
                                        enable: userData.enable,
                                        timestamp: new Date().toISOString()
                                    });
                                    localStorage.setItem("accessToken", "");
                                    localStorage.setItem("refreshToken", "");
                                    clearAuth();
                                    if (pathname.startsWith("/admin")) {
                                        router.replace("/login");
                                    }
                                    return;
                                }
                                const user = {
                                    id: userData.id,
                                    email: userData.mail,
                                    username: userData.username,
                                    role: ((_userData_roles = userData.roles) === null || _userData_roles === void 0 ? void 0 : _userData_roles.some({
                                        "AuthProvider.useEffect.fetchUser": (role)=>role.name === "ADMIN"
                                    }["AuthProvider.useEffect.fetchUser"])) ? "admin" : "moderator",
                                    avatar: undefined
                                };
                                setUser(user);
                                console.log("🎉 AuthProvider: User set successfully", {
                                    user: {
                                        id: user.id,
                                        username: user.username,
                                        email: user.email,
                                        role: user.role
                                    },
                                    timestamp: new Date().toISOString()
                                });
                                // If on login page and successfully authenticated, redirect to dashboard
                                if (pathname === "/login") {
                                    console.log("🚀 AuthProvider: Redirecting from login to dashboard", {
                                        from: pathname,
                                        to: "/admin/dashboard",
                                        timestamp: new Date().toISOString()
                                    });
                                    router.replace("/admin/dashboard");
                                }
                            } else {
                                // User fetch failed, clear auth
                                console.log("❌ AuthProvider: User fetch failed, clearing auth", {
                                    code: userResponse.code,
                                    message: userResponse.message,
                                    timestamp: new Date().toISOString()
                                });
                                localStorage.setItem("accessToken", "");
                                localStorage.setItem("refreshToken", "");
                                clearAuth();
                                if (pathname.startsWith("/admin")) {
                                    router.replace("/login");
                                }
                            }
                        } else {
                            var _introspectResponse_result6;
                            // Invalid token, clear auth
                            console.log("🚫 AuthProvider: Invalid token, clearing auth", {
                                code: introspectResponse.code,
                                isValid: (_introspectResponse_result6 = introspectResponse.result) === null || _introspectResponse_result6 === void 0 ? void 0 : _introspectResponse_result6.isValid,
                                timestamp: new Date().toISOString()
                            });
                            localStorage.setItem("accessToken", "");
                            localStorage.setItem("refreshToken", "");
                            clearAuth();
                            if (pathname.startsWith("/admin")) {
                                router.replace("/login");
                                return;
                            }
                        }
                    } catch (error) {
                        var _errorObj_response, _errorObj_response1, _errorObj_config;
                        const errorObj = error;
                        console.error("💥 AuthProvider: Auth validation error:", {
                            message: errorObj.message,
                            response: (_errorObj_response = errorObj.response) === null || _errorObj_response === void 0 ? void 0 : _errorObj_response.data,
                            status: (_errorObj_response1 = errorObj.response) === null || _errorObj_response1 === void 0 ? void 0 : _errorObj_response1.status,
                            url: (_errorObj_config = errorObj.config) === null || _errorObj_config === void 0 ? void 0 : _errorObj_config.url,
                            timestamp: new Date().toISOString(),
                            stack: errorObj.stack
                        });
                        // Only clear auth and redirect if we're not on the login page
                        // This prevents the redirect loop when login is successful
                        if (pathname !== "/login") {
                            localStorage.setItem("accessToken", "");
                            localStorage.setItem("refreshToken", "");
                            clearAuth();
                            if (pathname.startsWith("/admin")) {
                                router.replace("/login");
                                return;
                            }
                        }
                    }
                }
            }["AuthProvider.useEffect.fetchUser"];
            // Check if we need to redirect from login page when user is already set
            if (user !== null && pathname === "/login") {
                console.log("🔄 AuthProvider: User already set, redirecting from login to dashboard", {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    from: pathname,
                    to: "/admin/dashboard",
                    timestamp: new Date().toISOString()
                });
                router.replace("/admin/dashboard");
                return;
            }
            // If user is authenticated and trying to access admin routes, allow it
            if (user !== null && pathname.startsWith("/admin")) {
                console.log("✅ AuthProvider: User authenticated, allowing access to admin routes", {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    pathname,
                    timestamp: new Date().toISOString()
                });
                return;
            }
            // Only run validation if we have a token and no user yet
            if ((tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) && user === null) {
                console.log("🔄 AuthProvider: Running fetchUser", {
                    hasToken: !!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken),
                    user: user,
                    pathname,
                    timestamp: new Date().toISOString()
                });
                fetchUser();
            } else if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) && pathname.startsWith("/admin")) {
                // No token and trying to access admin routes
                console.log("🚫 AuthProvider: No token, redirecting to login", {
                    hasToken: !!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken),
                    pathname,
                    timestamp: new Date().toISOString()
                });
                router.replace("/login");
            }
        }
    }["AuthProvider.useEffect"], [
        router,
        pathname,
        clearAuth,
        setAccessToken,
        setUser,
        user,
        tokens,
        setRefreshToken
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(AuthProvider, "+MXsubjeHDrmTMZ5ZFAfk1yRQfE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/QueryProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QueryProvider",
    ()=>QueryProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query-devtools/build/modern/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function QueryProvider(param) {
    let { children } = param;
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "QueryProvider.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        retry: 2,
                        refetchOnWindowFocus: false
                    },
                    mutations: {
                        retry: 1
                    }
                }
            })
    }["QueryProvider.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReactQueryDevtools"], {
                initialIsOpen: false
            }, void 0, false, {
                fileName: "[project]/src/hooks/QueryProvider.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/hooks/QueryProvider.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(QueryProvider, "1aEk2VqmRi7MRA2Jl58nrOlz9Gg=");
_c = QueryProvider;
var _c;
__turbopack_context__.k.register(_c, "QueryProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1d16b8f2._.js.map