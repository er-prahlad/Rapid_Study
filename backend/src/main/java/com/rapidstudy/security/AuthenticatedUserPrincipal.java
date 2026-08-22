package com.rapidstudy.security;

import com.rapidstudy.enums.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Principal stored in the Spring SecurityContext for every authenticated request.
 *
 * Contains userId, email, and role extracted directly from the JWT —
 * no database round-trip needed in controllers.
 *
 * Controllers access it via SecurityUtil.currentUser().
 */
@Getter
public class AuthenticatedUserPrincipal implements UserDetails {

    private final Long   userId;
    private final String email;
    private final Role   role;

    public AuthenticatedUserPrincipal(Long userId, String email, Role role) {
        this.userId = userId;
        this.email  = email;
        this.role   = role;
    }

    // UserDetails contract -------------------------------------------

    @Override
    public String getUsername() {
        return email;
    }

    /** Password is not stored here — authentication already verified via JWT. */
    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }

    // Convenience check -----------------------------------------------

    public boolean isAdmin()   { return role == Role.ADMIN; }
    public boolean isStudent() { return role == Role.STUDENT; }

    @Override
    public String toString() {
        return "AuthenticatedUserPrincipal{userId=" + userId + ", email='" + email + "', role=" + role + '}';
    }
}
