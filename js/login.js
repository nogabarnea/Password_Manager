// where we keep the fail count and the lockout end time between page refreshes
const ATTEMPTS_KEY = "login_attempts";
const LOCKOUT_KEY  = "login_lockout_until";

// need config before anything else runs
(async () => {
    try {
        const res = await fetch("/config.json");
        const config = await res.json();
        init(config);
    } catch {
        alert("could not load config.json");
    }
})();


function init(config) {

    function getLockoutSecondsLeft() {
        let lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
        if (!lockoutUntil) return 0;
        let secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
        return secondsLeft > 0 ? secondsLeft : 0;
    }

    function disableForm() {
        document.getElementById("login-form").querySelector("button[type=submit]").disabled = true;
        document.getElementById("username").disabled = true;
        document.getElementById("password").disabled = true;
    }

    function enableForm() {
        document.getElementById("login-form").querySelector("button[type=submit]").disabled = false;
        document.getElementById("username").disabled = false;
        document.getElementById("password").disabled = false;
        document.getElementById("lockout-box").style.display = "none";
    }

    function startCountdown() {
        let box = document.getElementById("lockout-box");
        let counter = document.getElementById("lockout-counter");
        box.style.display = "block";

        // Put in the HTML how many seconds are lft for iyt to be updated later
        counter.textContent = getLockoutSecondsLeft();

        let interval = setInterval(function() {
            let secondsLeft = getLockoutSecondsLeft();
            if (secondsLeft <= 0) {
                // time's up, clear the lockout and let them try again
                localStorage.removeItem(LOCKOUT_KEY);
                localStorage.removeItem(ATTEMPTS_KEY);
                clearInterval(interval);
                enableForm();
            } else {
                counter.textContent = secondsLeft;
            }
        }, 1000);
    }

    //keep the lockdown and countdown even if page is refreshed
    if (getLockoutSecondsLeft() > 0) {
        disableForm();
        startCountdown();
    }
    //if get here from sing-up
    document.getElementById("login-form").addEventListener("submit", async function(e) {
        e.preventDefault();

        if (getLockoutSecondsLeft() > 0) return; // in case of an edge case where they click submit right as the lockout finishes, this will prevent an extra attempt from being counted or a login attempt from being made when they shouldn't be allowed to

        ///////////// begin login, above is just preperation
        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value;

        if (!username || !password) {
            alert("please fill in both fields");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });

            const result = await response.json();

            if (result.success) {
                // logged in, clean up any old attempt data before moving on
                localStorage.removeItem(ATTEMPTS_KEY);
                localStorage.removeItem(LOCKOUT_KEY);
                sessionStorage.setItem("user_id", result.user_id);
                sessionStorage.setItem("username", result.username);
                alert("Logged in successfully!");
                window.location.href = "index.html";
            } else {
                // wrong password, add to the fail count, maybe start a lockout
                let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0") + 1;
                localStorage.setItem(ATTEMPTS_KEY, attempts);

                if (attempts >= config.MAX_LOGIN_ATTEMPTS) {
                    // too many fails, save when they're allowed back and start the timer
                    let lockoutUntil = Date.now() + config.LOCKOUT_SECONDS * 1000;
                    localStorage.setItem(LOCKOUT_KEY, lockoutUntil);
                    disableForm();
                    startCountdown();
                    alert("too many failed attempts. locked out for " + config.LOCKOUT_SECONDS + " seconds.");
                } else {
                    let attemptsLeft = config.MAX_LOGIN_ATTEMPTS - attempts;
                    alert("wrong username or password. " + attemptsLeft + " attempt(s) left.");
                }
            }
        } catch (error) {
            alert("could not reach the server");
        }
    });
}
