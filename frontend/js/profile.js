// ========================================
// PROFILE PAGE (BACKEND INTEGRATED)
// ========================================

const API_BASE_URL = window.location.port === "5000" ? `${window.location.origin}/api` : "http://127.0.0.1:5000/api";

let loggedInUser = null;
try {
    const rawUser = localStorage.getItem("loggedInUser");
    loggedInUser = rawUser ? JSON.parse(rawUser) : null;
} catch (e) {
    console.error("Error reading user state:", e);
}

if (!loggedInUser || !loggedInUser.token) {
    window.location.href = "index.html";
}

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileNameDetail = document.getElementById("profileNameDetail");
const profileEmailDetail = document.getElementById("profileEmailDetail");
const editProfileForm = document.getElementById("editProfileForm");
const profileMessage = document.getElementById("profileMessage");

function handleUnauthorized() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}


// ========================================
// FETCH USER PROFILE FROM BACKEND
// ========================================

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${loggedInUser.token}`
            }
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (response.ok) {
            const data = await response.json();
            const name = data.name || "User";
            const email = data.email || "No email available";

            if (profileName) profileName.textContent = name;
            if (profileEmail) profileEmail.textContent = email;
            if (profileNameDetail) profileNameDetail.textContent = name;
            if (profileEmailDetail) profileEmailDetail.textContent = email;

            const editNameInput = document.getElementById("editNameInput");
            if (editNameInput) editNameInput.value = name;

            // Sync loggedInUser name locally
            loggedInUser.name = name;
            loggedInUser.email = email;
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        }
    } catch (error) {
        console.error("Error loading profile from backend:", error);
    }
}

loadUserProfile();


// ========================================
// EDIT PROFILE FORM SUBMISSION
// ========================================

if (editProfileForm) {
    editProfileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const editNameInput = document.getElementById("editNameInput");
        const newName = editNameInput ? editNameInput.value.trim() : "";

        if (!newName) return;

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${loggedInUser.token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();

            if (response.ok) {
                loggedInUser.name = newName;
                localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

                if (profileName) profileName.textContent = newName;
                if (profileNameDetail) profileNameDetail.textContent = newName;

                if (profileMessage) {
                    profileMessage.textContent = "Profile updated successfully!";
                    profileMessage.style.color = "var(--income)";
                    profileMessage.style.display = "block";
                    setTimeout(() => {
                        profileMessage.style.display = "none";
                    }, 3000);
                }
            } else {
                if (profileMessage) {
                    profileMessage.textContent = data.error || "Failed to update profile.";
                    profileMessage.style.color = "#ff6b6b";
                    profileMessage.style.display = "block";
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn = document.getElementById("logoutBtn");
const profileLogoutBtn = document.getElementById("profileLogoutBtn");

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (profileLogoutBtn) profileLogoutBtn.addEventListener("click", logout);