try {
    const rawUser = localStorage.getItem("loggedInUser");
    if (rawUser && JSON.parse(rawUser)?.token) {
        window.location.href = "dashboard.html";
    }
} catch (e) {
    localStorage.removeItem("loggedInUser");
}

const API_BASE_URL = window.location.port === "5000" ? `${window.location.origin}/api` : "http://127.0.0.1:5000/api";

// ========================================
// GET HTML ELEMENTS
// ========================================

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");

// Interactive elements
const toggleLoginPasswordBtn = document.getElementById("toggleLoginPasswordBtn");
const toggleRegisterPasswordBtn = document.getElementById("toggleRegisterPasswordBtn");
const rememberMeCheckbox = document.getElementById("rememberMe");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const loginEmailInput = document.getElementById("loginEmail");


// ========================================
// REMEMBER ME INITIALIZATION
// ========================================
const rememberedEmail = localStorage.getItem("rememberedEmail");
if (rememberedEmail && loginEmailInput) {
    loginEmailInput.value = rememberedEmail;
    if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = true;
    }
}


// ========================================
// PASSWORD VISIBILITY TOGGLES
// ========================================

if (toggleLoginPasswordBtn) {
    toggleLoginPasswordBtn.addEventListener("click", function () {
        const passwordInput = document.getElementById("loginPassword");
        if (passwordInput) {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                this.innerHTML = `<span class="eye-icon">🙈</span>`;
            } else {
                passwordInput.type = "password";
                this.innerHTML = `<span class="eye-icon">👁️</span>`;
            }
        }
    });
}

if (toggleRegisterPasswordBtn) {
    toggleRegisterPasswordBtn.addEventListener("click", function () {
        const passwordInput = document.getElementById("registerPassword");
        const confirmInput = document.getElementById("confirmPassword");
        if (passwordInput) {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                if (confirmInput) confirmInput.type = "text";
                this.innerHTML = `<span class="eye-icon">🙈</span>`;
            } else {
                passwordInput.type = "password";
                if (confirmInput) confirmInput.type = "password";
                this.innerHTML = `<span class="eye-icon">👁️</span>`;
            }
        }
    });
}


// ========================================
// FORGOT PASSWORD ACTION
// ========================================

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", function (event) {
        event.preventDefault();
        if (loginError) {
            loginError.textContent = "Notice: Please contact support or reset password via your account settings.";
            loginError.style.display = "block";
        }
    });
}


// ========================================
// SHOW REGISTER / LOGIN TOGGLES
// ========================================

if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", function () {
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
        if (loginError) loginError.textContent = "";
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener("click", function () {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
        if (registerError) registerError.textContent = "";
        if (registerSuccess) registerSuccess.textContent = "";
    });
}


// ========================================
// REGISTER VIA BACKEND API
// ========================================

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (registerError) registerError.textContent = "";
        if (registerSuccess) registerSuccess.textContent = "";

        if (password !== confirmPassword) {
            if (registerError) registerError.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (registerError) registerError.textContent = data.error || "Registration failed.";
                return;
            }

            if (registerSuccess) {
                registerSuccess.textContent = "Account created successfully!";
            }

            registerForm.reset();

            setTimeout(function () {
                registerSection.classList.add("hidden");
                loginSection.classList.remove("hidden");
                if (registerSuccess) registerSuccess.textContent = "";
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);
            if (registerError) registerError.textContent = "Server connection error. Please ensure Flask backend is running.";
        }
    });
}


// ========================================
// LOGIN VIA BACKEND API
// ========================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (loginError) loginError.textContent = "";

        if (rememberMeCheckbox) {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem("rememberedEmail", email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (loginError) loginError.textContent = data.error || "Invalid email or password.";
                return;
            }

            const loggedInUserObj = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                token: data.token
            };

            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUserObj));

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);
            if (loginError) loginError.textContent = "Server connection error. Please ensure Flask backend is running.";
        }
    });
}