package com.rapidstudy.util;

import com.rapidstudy.exception.UnauthorizedException;
import com.rapidstudy.security.AuthenticatedUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Convenience utility for controllers and services to access
 * the currently authenticated user without boilerplate.
 *
 * Usage:
 *   AuthenticatedUserPrincipal me = SecurityUtil.currentUser();
 *   Long userId = SecurityUtil.currentUserId();
 */
public final class SecurityUtil {

    private SecurityUtil() {}

    /**
     * Returns the AuthenticatedUserPrincipal for the current request.
     *
     * @throws UnauthorizedException if the request is not authenticated
     */
    public static AuthenticatedUserPrincipal currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || !(auth.getPrincipal() instanceof AuthenticatedUserPrincipal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        return (AuthenticatedUserPrincipal) auth.getPrincipal();
    }

    /**
     * Shortcut for currentUser().getUserId().
     *
     * @throws UnauthorizedException if the request is not authenticated
     */
    public static Long currentUserId() {
        return currentUser().getUserId();
    }

    /**
     * Returns true if the current user has the ADMIN role.
     */
    public static boolean isAdmin() {
        return currentUser().isAdmin();
    }
}
