const API_BASE_URL = "http://localhost:5000";

let currentSection = "dashboard";


document.addEventListener("DOMContentLoaded", async () => {
    const authenticated = await checkAuthentication();

    if (!authenticated) {
        return;
    }

    loadUserData();
    setupOutsideClick();
});


async function checkAuthentication() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/applicant-area`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            console.warn("Authentication failed.");
            clearAuthentication();
            redirectToLogin();
            return false;
        }

        if (response.status === 403) {
            console.warn("Applicant access required.");
            clearAuthentication();
            redirectToLogin();
            return false;
        }

        if (!response.ok) {
            console.error("Authentication verification failed.");
            clearAuthentication();
            redirectToLogin();
            return false;
        }

        const data = await response.json();

        if (!data.success) {
            clearAuthentication();
            redirectToLogin();
            return false;
        }

        return true;

    } catch (error) {
        console.error("Authentication verification error:", error);
        return false;
    }
}


function redirectToLogin() {
    window.location.href = "Auth.html";
}


async function loadUserData() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        return;
    }

    const storedUser = getStoredUser();

    if (storedUser) {
        updateUserInterface(storedUser);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            clearAuthentication();
            redirectToLogin();
            return;
        }

        if (!response.ok) {
            console.error("Profile request failed:", response.status);
            return;
        }

        const data = await response.json();

        if (data.success && data.user) {
            updateUserInterface(data.user);

            const existingUser = getStoredUser();

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...(existingUser || {}),
                    ...data.user
                })
            );
        }

    } catch (error) {
        console.error("Profile loading error:", error);
    }
}


function getStoredUser() {
    try {
        const user = localStorage.getItem("user");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {
        console.error("User data parsing error:", error);
        return null;
    }
}


function updateUserInterface(user) {
    const fullName = user.fullName || user.name || "Applicant";
    const email = user.email || "applicant@example.com";

    const firstName =
        fullName.trim().split(" ")[0] || "Applicant";

    const initials = fullName
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const welcomeName =
        document.getElementById("welcome-name");

    const headerName =
        document.getElementById("header-user-name");

    const avatar =
        document.getElementById("user-avatar");

    const profileAvatar =
        document.getElementById("profile-avatar");

    const profileName =
        document.getElementById("profile-name");

    const profileEmail =
        document.getElementById("profile-email");

    const profileFullName =
        document.getElementById("profile-full-name");

    const profileEmailInput =
        document.getElementById("profile-email-input");


    if (welcomeName) {
        welcomeName.textContent = firstName;
    }

    if (headerName) {
        headerName.textContent = fullName;
    }

    if (avatar) {
        avatar.textContent = initials || "A";
    }

    if (profileAvatar) {
        profileAvatar.textContent = initials || "A";
    }

    if (profileName) {
        profileName.textContent = fullName;
    }

    if (profileEmail) {
        profileEmail.textContent = email;
    }

    if (profileFullName) {
        profileFullName.value = fullName;
    }

    if (profileEmailInput) {
        profileEmailInput.value = email;
    }
}


function showSection(sectionName, clickedElement = null) {
    const sections =
        document.querySelectorAll(".content-section");

    sections.forEach(section => {
        section.classList.remove("active");
    });


    const targetSection =
        document.getElementById(`section-${sectionName}`);

    if (!targetSection) {
        console.warn(`Section not found: ${sectionName}`);
        return;
    }

    targetSection.classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    const navItem =
        clickedElement ||
        document.querySelector(
            `.nav-item[data-section="${sectionName}"]`
        );

    if (navItem) {
        navItem.classList.add("active");
    }


    currentSection = sectionName;

    updatePageLabel(sectionName);

    closeUserMenu();
    closeNotifications();
    closeMobileSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function updatePageLabel(sectionName) {
    const labels = {
        dashboard: "Dashboard",
        opportunities: "Opportunities",
        applications: "My Applications",
        documents: "Documents",
        reports: "Verification Reports",
        profile: "Profile"
    };

    const label =
        document.getElementById("page-label");

    if (label) {
        label.textContent =
            labels[sectionName] || "Dashboard";
    }
}


function toggleUserMenu() {
    const dropdown =
        document.getElementById("user-dropdown");

    if (!dropdown) {
        return;
    }

    dropdown.classList.toggle("show");
}


function closeUserMenu() {
    const dropdown =
        document.getElementById("user-dropdown");

    if (dropdown) {
        dropdown.classList.remove("show");
    }
}


function setupOutsideClick() {
    document.addEventListener("click", event => {
        const userMenu =
            document.querySelector(".user-menu");

        const dropdown =
            document.getElementById("user-dropdown");

        if (
            userMenu &&
            dropdown &&
            !userMenu.contains(event.target)
        ) {
            dropdown.classList.remove("show");
        }
    });
}


function showNotifications() {
    const panel =
        document.getElementById("notification-panel");

    if (!panel) {
        return;
    }

    panel.classList.toggle("show");
}


function closeNotifications() {
    const panel =
        document.getElementById("notification-panel");

    if (panel) {
        panel.classList.remove("show");
    }
}


function toggleSidebar() {
    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebar-overlay");

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
}


function closeMobileSidebar() {
    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }
}


function handleSearch(value) {
    const searchTerm =
        value.trim().toLowerCase();

    if (!searchTerm) {
        return;
    }


    document
        .querySelectorAll(".application-row")
        .forEach(row => {
            const text =
                row.textContent.toLowerCase();

            row.style.display =
                text.includes(searchTerm)
                    ? ""
                    : "none";
        });


    document
        .querySelectorAll(".document-card")
        .forEach(card => {
            const text =
                card.textContent.toLowerCase();

            card.style.display =
                text.includes(searchTerm)
                    ? ""
                    : "none";
        });
}


document.addEventListener("input", event => {
    if (event.target.id !== "global-search") {
        return;
    }

    if (event.target.value.trim() === "") {

        document
            .querySelectorAll(".application-row")
            .forEach(row => {
                row.style.display = "";
            });

        document
            .querySelectorAll(".document-card")
            .forEach(card => {
                card.style.display = "";
            });
    }
});


async function logout() {
    const token =
        localStorage.getItem("authToken");

    try {
        if (token) {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
        }

    } catch (error) {
        console.error(
            "Logout request error:",
            error
        );

    } finally {
        clearAuthentication();
        redirectToLogin();
    }
}


function clearAuthentication() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
}


document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    closeUserMenu();
    closeNotifications();
    closeMobileSidebar();
});