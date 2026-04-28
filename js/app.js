// if no one is logged in, kick them back to login page
let currentUserId = sessionStorage.getItem("user_id");
let currentUsername = sessionStorage.getItem("username");
if (!currentUserId) {
    window.location.href = "login.html";
}

async function loadPasswords() {
    try {
        // only get passwords that belong to this user
        const response = await fetch("/api/passwords?user_id=" + currentUserId);
        const passwords = await response.json();
        displayPasswords(passwords);
    } catch (error) {
        console.error("Error loading passwords:", error);
        displayPasswords([]);
    }
}

function logout() {
    //clear the saved user info and go back to login
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("username");
    window.location.href = "login.html";
}

async function addPassword() {
    let service = document.getElementById("service").value.trim();
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    if (!service || !username || !password) {
        alert("Please fill in all fields!");
        return;
    }
    try {
        const response = await fetch("/api/passwords", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                service: service,
                username: username,
                password: password,
                user_id: currentUserId
            })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById("add-form").reset();
            loadPasswords();
            alert("Password saved successfully!");
        } else {
            alert("Failed to save: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        alert("Could not reach the server. Is it running?");
    }
}

async function generatePassword() {
    try {
        const response = await fetch("/api/generate");
        const result = await response.json();
        document.getElementById("password").value = result.password;
        document.getElementById("password").type = "text";
        setTimeout(function() {
          document.getElementById("password").type = "password";
       }, 3000); // hide password after 3 seconds
    } catch (error) { // create password here if server fails
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        document.getElementById("password").value = password;
    }
}

/**
 *
 * @param {Array} passwords // array of object in the form of json {id, service, username, password}
 */
function displayPasswords(passwords) {
    let listContainer = document.getElementById("password-list");
        listContainer.innerHTML = ""; // cear existing list
        if (!passwords || passwords.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">No passwords saved yet.</p>';
        return;
    }
        passwords.forEach(function(entry) {
        let itemHTML = createPasswordItemHTML(entry); // only building HTML here
        listContainer.innerHTML += itemHTML;
    });
        addPasswordItemListeners();
}

/**
 * @param {Object} entry
 * @returns {string}
 */
function createPasswordItemHTML(entry) {
    return `
        <div class="password-item" data-id="${entry.id}" data-encrypted="${escapeHTML(entry.password)}">
            <div class="service-name">${escapeHTML(entry.service)}</div>
            <div class="username">User: ${escapeHTML(entry.username)}</div>
            <div class="password-row">
                <input type="password" class="password-display" value="********" readonly>
                <div class="actions">
                    <button class="btn-secondary btn-small show-btn">Show</button>
                    <button class="btn-danger btn-small delete-btn">Delete</button>
                </div>
            </div>
        </div>
    `;
}


function addPasswordItemListeners() { //show/hide password buttons and delete buttons
    document.querySelectorAll(".show-btn").forEach(function(btn) {
        btn.addEventListener("click", async function() {
            let item = this.closest(".password-item"); //get the div the button is in
            let passwordInput = item.querySelector(".password-display"); //get the input field inside that div
            if (passwordInput.type === "password") {
                //Get password and remove the dots and change to password
                let encrypted = item.dataset.encrypted;
                try {
                    const response = await fetch("/api/decrypt", { // decrypt password
                        method: "POST", // POST doesn't appear in the URL - safer then GET
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ encrypted: encrypted })
                    });
                    const result = await response.json();
                    passwordInput.value = result.decrypted; // show decrypted password
                    passwordInput.type = "text";
                    this.textContent = "Hide";
                } catch (error) {
                    console.error("Error decrypting:", error);
                    alert("Error decrypting password");
                }
            } else {
                passwordInput.value = "********";
                passwordInput.type = "password";
                this.textContent = "Show";
            }
        });
    });
    //delete password
    document.querySelectorAll(".delete-btn").forEach(function(btn) {
        btn.addEventListener("click", async function() {
            if (confirm("Are you sure you want to delete this password?")) {
                let item = this.closest(".password-item");
                let id = item.dataset.id;
                try {
                    const response = await fetch("/api/passwords/" + id, {
                        method: "DELETE"
                    });
                    const result = await response.json();
                    if (result.success) {
                        loadPasswords();
                        alert("Password deleted!");
                    } else {
                        alert("Failed to delete: " + (result.error || "Unknown error"));
                    }
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Error deleting password");
                }
            }
        });
    });
}

async function clearAll() {
    alert("This will delete ALL passwords. This action cannot be undone.");
    if (confirm("Are you sure you want to delete ALL passwords?")) {
        try {
            await fetch("/api/all/passwords/" + currentUserId, {
                method: "DELETE"
            });
            loadPasswords();
            alert("All passwords cleared");
        } catch (error) {
            console.error("Error clearing passwords:", error);
            alert("Error clearing passwords");
        }
    }
}

/**
 *
 * @param {string} text
 * @returns {string}
 */
function escapeHTML(text) { // defense againt XSS
    if (!text) return "";
    let div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// show the username in the header
document.getElementById("display-username").textContent = currentUsername;

loadPasswords();
document.getElementById("add-form").addEventListener("submit", addPassword);
document.getElementById("generateButton").addEventListener("click", generatePassword);
document.getElementById("clearAllButton").addEventListener("click", clearAll);
document.getElementById("logoutButton").addEventListener("click", logout);
