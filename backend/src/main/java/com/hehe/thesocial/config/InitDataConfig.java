package com.hehe.thesocial.config;

import com.hehe.thesocial.constant.PredefinedRoles;
import com.hehe.thesocial.dto.request.role.RoleRequest;
import com.hehe.thesocial.dto.request.user.RegisterRequest;
import com.hehe.thesocial.entity.Role;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.repository.RoleRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.service.role.RoleService;
import com.hehe.thesocial.service.user.UserService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class InitDataConfig {

    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailRepository userDetailRepository;

    @PostConstruct
    public void initData() {
        log.info("Starting data initialization...");

        // Check if admin role exists, create it if not
        Optional<Role> adminRoleOptional = roleRepository.findByRoleName(PredefinedRoles.ADMIN_ROLE);
        Role adminRole;

        if (adminRoleOptional.isEmpty()) {
            log.info("Admin role not found, creating it...");
            RoleRequest roleRequest = new RoleRequest();
            roleRequest.setRoleName(PredefinedRoles.ADMIN_ROLE);
            roleRequest.setDescription("Administrator role with full access");
            adminRole = convertToRole(roleService.createRole(roleRequest), PredefinedRoles.ADMIN_ROLE);
        } else {
            adminRole = adminRoleOptional.get();
            log.info("Admin role already exists");
        }

        // Check if user role exists, create it if not
        Optional<Role> userRoleOptional = roleRepository.findByRoleName(PredefinedRoles.USER_ROLE);
        Role userRole;

        if (userRoleOptional.isEmpty()) {
            log.info("User role not found, creating it...");
            RoleRequest roleRequest = new RoleRequest();
            roleRequest.setRoleName(PredefinedRoles.USER_ROLE);
            roleRequest.setDescription("Regular user role with standard access");
            userRole = convertToRole(roleService.createRole(roleRequest), PredefinedRoles.USER_ROLE);
        } else {
            userRole = userRoleOptional.get();
            log.info("User role already exists");
        }

        // Check if any user exists, if not create admin user and regular users
        if (userRepository.count() == 0) {
            log.info("No users found, creating initial users...");

            // Create admin user directly with admin role
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .enable(true)
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .build();

            adminUser = userRepository.save(adminUser);
            
            // Create UserDetail for admin user
            UserDetail adminUserDetail = UserDetail.builder()
                    .user(adminUser)
                    .displayName(adminUser.getUsername())
                    .shownName("@" + adminUser.getUsername())
                    .build();
            
            userDetailRepository.save(adminUserDetail);
            log.info("Admin user created successfully");



            // Create first regular user
            userService.register(RegisterRequest.builder()
                    .username("user1")
                    .password("user123")
                    .mail("user1@thesocial.com")
                    .build());

            // Get the registered user
            Optional<User> user1 = userRepository.findByUsername("user1");

            if (user1.isPresent()) {
                Set<Role> user1Roles = new HashSet<>();
                user1Roles.add(userRole);
                user1.get().setRoles(user1Roles);

                userRepository.save(user1.get());
                log.info("User1 created successfully");
            }

            // Create second regular user
            userService.register(RegisterRequest.builder()
                    .username("user2")
                    .password("user123")
                    .mail("user2@thesocial.com")
                    .build());

            // Get the registered user
            Optional<User> user2 = userRepository.findByUsername("user2");

            if (user2.isPresent()) {
                Set<Role> user2Roles = new HashSet<>();
                user2Roles.add(userRole);
                user2.get().setRoles(user2Roles);

                userRepository.save(user2.get());
                log.info("User2 created successfully");
            }
        } else {
            log.info("Users already exist, skipping user creation");
        }
    }

    private Role convertToRole(Object roleResponse, String roleName) {
        // This is a simple way to get the Role entity from the RoleResponse
        // In a real scenario, you might want to find the role by ID/name after creation
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Failed to create role: " + roleName));
    }
}
