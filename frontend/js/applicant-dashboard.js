const API_BASE_URL = "http://localhost:5000";
let selectedOpportunityId = null;
let currentSection = "dashboard";


document.addEventListener("DOMContentLoaded", async () => {
    const authenticated = await checkAuthentication();

    if (!authenticated) return;

    await loadUserData();
    await loadOpportunities();
    await loadMyApplications();

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

async function saveProfile() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "Auth.html";
        return;
    }

    const fullNameInput = document.getElementById("profile-full-name");

    if (!fullNameInput) {
        console.error("Profile name input not found.");
        return;
    }

    const fullName = fullNameInput.value.trim();

    if (!fullName) {
        alert("Full name is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName
            })
        });

        const data = await response.json();

        if (response.status === 401) {
            clearAuthentication();
            window.location.href = "Auth.html";
            return;
        }

        if (!response.ok || !data.success) {
            alert(data.message || "Profile update failed.");
            return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));

        updateUserInterface(data.user);

        alert("Profile updated successfully.");

    } catch (error) {
        console.error("Profile update error:", error);
        alert("Unable to update profile. Please try again.");
    }
}

async function loadOpportunities() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "Auth.html";
        return;
    }

    const opportunityGrid = document.getElementById("opportunity-grid");

    if (!opportunityGrid) {
        console.error("Opportunity grid not found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/opportunities`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            clearAuthentication();
            window.location.href = "Auth.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            opportunityGrid.innerHTML = `
                <p>Unable to load opportunities.</p>
            `;

            console.error(
                "Failed to load opportunities:",
                data.message || "Unknown error"
            );

            return;
        }

        if (!data.opportunities || data.opportunities.length === 0) {
            opportunityGrid.innerHTML = `
                <p>No active opportunities available.</p>
            `;

            return;
        }

window.loadedOpportunities = data.opportunities;

opportunityGrid.innerHTML = data.opportunities
    .map(opportunity => createOpportunityCard(opportunity))
    .join("");

console.log("Opportunities loaded:", window.loadedOpportunities);

    } catch (error) {
        console.error("Opportunity loading error:", error);

        opportunityGrid.innerHTML = `
            <p>Unable to load opportunities.</p>
        `;
    }
}
function createOpportunityCard(opportunity) {
    const deadline = new Date(opportunity.deadline);

    const formattedDeadline = deadline.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

    return `
        <article class="opportunity-card">

            <div class="opportunity-top">

                <span class="opportunity-tag">
                    OPPORTUNITY
                </span>

                <span class="status verified">
                    Open
                </span>

            </div>

            <h3>
                ${escapeHtml(opportunity.title)}
            </h3>

            <p>
                ${escapeHtml(opportunity.description)}
            </p>

            <div class="opportunity-meta">

                <span>
                    Deadline: ${formattedDeadline}
                </span>

                <span>
                    ${opportunity.requiredDocuments} Documents
                </span>

            </div>

            <button
                class="primary-btn small"
                type="button"
                onclick="viewOpportunity('${opportunity._id}')"
            >
                View Opportunity
            </button>

        </article>
    `;
}
function viewOpportunity(opportunityId) {
    console.log("Clicked opportunity ID:", opportunityId);

    const opportunities = window.loadedOpportunities || [];

    const opportunity = opportunities.find(
        item => item._id === opportunityId
    );

    if (!opportunity) {
        console.error("Opportunity not found:", opportunityId);
        return;
    }

    const modal = document.getElementById("opportunity-modal");

    if (!modal) {
        console.error("Opportunity modal not found.");
        return;
    }

    selectedOpportunityId = opportunity._id;

    document.getElementById("opportunity-modal-title").textContent =
        opportunity.title;

    document.getElementById("opportunity-modal-description").textContent =
        opportunity.description;

    document.getElementById("opportunity-modal-organization").textContent =
        opportunity.organization;

    document.getElementById("opportunity-modal-deadline").textContent =
        new Date(opportunity.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        });

    document.getElementById("opportunity-modal-documents").textContent =
        `${opportunity.requiredDocuments} Documents`;

    document.getElementById("opportunity-modal-status").textContent =
        opportunity.status.charAt(0).toUpperCase() +
        opportunity.status.slice(1);

    const applyButton = document.getElementById(
        "apply-opportunity-btn"
    );

    if (applyButton) {
        applyButton.disabled = false;
        applyButton.textContent = "Apply Now";
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    console.log("Opportunity modal opened:", opportunity);
}
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}
function closeOpportunityModal() {
    const modal = document.getElementById("opportunity-modal");

    if (!modal) return;

    modal.classList.remove("active");

    setTimeout(() => {
        modal.setAttribute("aria-hidden", "true");
    }, 0);
}
async function applyForOpportunity() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "Auth.html";
        return;
    }

    if (!selectedOpportunityId) {
        alert("Please select an opportunity first.");
        return;
    }

    const applyButton = document.getElementById(
        "apply-opportunity-btn"
    );

    try {
        if (applyButton) {
            applyButton.disabled = true;
            applyButton.textContent = "Submitting...";
        }

        const response = await fetch(
            `${API_BASE_URL}/api/applications`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    opportunityId: selectedOpportunityId
                })
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            clearAuthentication();
            window.location.href = "Auth.html";
            return;
        }

        if (response.status === 409) {
            alert(
                data.message ||
                "You have already applied for this opportunity."
            );
            return;
        }

        if (!response.ok || !data.success) {
            alert(
                data.message ||
                "Unable to submit application."
            );
            return;
        }

        alert("Application submitted successfully.");

        closeOpportunityModal();

        await loadMyApplications();

    } catch (error) {
        console.error(
            "Application submission error:",
            error
        );

        alert(
            "Unable to submit application. Please try again."
        );

    } finally {
        if (applyButton) {
            applyButton.disabled = false;
            applyButton.textContent = "Apply Now";
        }
    }
}

async function loadMyApplications() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "Auth.html";
        return;
    }

    const applicationList =
        document.getElementById("application-list");

    if (!applicationList) {
        console.error("Application list not found.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/applications/my`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401) {
            clearAuthentication();
            window.location.href = "Auth.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            applicationList.innerHTML = `
                <p>Unable to load applications.</p>
            `;
            return;
        }

        if (
            !data.applications ||
            data.applications.length === 0
        ) {
            applicationList.innerHTML = `
                <p>You have not applied for any opportunity yet.</p>
            `;
            return;
        }

        applicationList.innerHTML =
            data.applications
                .map(application =>
                    createApplicationCard(application)
                )
                .join("");

        console.log(
            "Applications loaded:",
            data.applications
        );

    } catch (error) {
        console.error(
            "Application loading error:",
            error
        );

        applicationList.innerHTML = `
            <p>Unable to load applications.</p>
        `;
    }
}
async function loadMyApplications() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "Auth.html";
        return;
    }

    const applicationTableBody = document.getElementById(
        "application-table-body"
    );

    if (!applicationTableBody) {
        console.error("Application table body not found.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/applications/my`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401) {
            clearAuthentication();
            window.location.href = "Auth.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            applicationTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load applications.
                    </td>
                </tr>
            `;
            return;
        }

        if (
            !data.applications ||
            data.applications.length === 0
        ) {
            applicationTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        You have not applied for any opportunity yet.
                    </td>
                </tr>
            `;
            return;
        }

        applicationTableBody.innerHTML =
            data.applications
                .map(application =>
                    createApplicationRow(application)
                )
                .join("");

        console.log(
            "Applications loaded:",
            data.applications
        );

    } catch (error) {
        console.error(
            "Application loading error:",
            error
        );

        applicationTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load applications.
                </td>
            </tr>
        `;
    }
}
function createApplicationRow(application) {
    const opportunity = application.opportunity;

    const submittedDate = new Date(
        application.appliedAt
    ).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

    const status = application.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

    let statusClass = "pending";

    if (application.status === "approved") {
        statusClass = "verified";
    }

    if (application.status === "rejected") {
        statusClass = "rejected";
    }

    return `
        <tr>

            <td>
                <strong>
                    ${escapeHtml(
                        opportunity?.title || "Opportunity"
                    )}
                </strong>
            </td>

            <td>
                ${submittedDate}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <span class="status pending">
                    Pending
                </span>
            </td>

            <td>
                <button
                    class="table-action"
                    type="button"
                    onclick="viewApplication('${application._id}')"
                >
                    View
                </button>
            </td>

        </tr>
    `;
}

function viewApplication(applicationId) {
    console.log(
        "Selected application:",
        applicationId
    );

    window.selectedApplicationId = applicationId;

    alert(
        `Application ID: ${applicationId}`
    );
}
