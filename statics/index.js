/* Exapand/Collapse with TAB key */
var expanded = false;
document.onkeydown = function (e) {
    if (e.keyCode === 9) {
        expanded = !expanded;
        document.querySelectorAll("details").forEach(detail => detail.open = expanded);
        return false;
    }
};

/* Switch Theme */
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (!e || !e.target) {
        return;
    }
    const themeIcon = document.getElementById("theme-icon");
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) {
            themeIcon.className = "ri-sun-line";
        }
        try {
            localStorage.setItem('theme', 'light');
        } catch (error) {
            // Ignore storage write errors for environments where storage is unavailable.
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.className = "ri-moon-line";
        }
        try {
            localStorage.setItem('theme', 'dark');
        } catch (error) {
            // Ignore storage write errors for environments where storage is unavailable.
        }
    }
}

if (toggleSwitch) {
    toggleSwitch.addEventListener('change', switchTheme, false);
    let currentTheme = null;
    try {
        currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    } catch (error) {
        currentTheme = null;
    }
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            toggleSwitch.checked = true;
        }
    }
}

const timestamp = document.getElementById("build-timestamp");
const timestamp_local = timestamp ? new Date(timestamp.getAttribute("datetime")).toLocaleString() : "";

const badge = document.getElementById("build-timestamp-badge");
// badge.src = `https://img.shields.io/github/workflow/status/mlnlp-world/myarxiv/Update?=${timestamp_local}&style=for-the-badge`

/* Track read days */
const READ_DAYS_STORAGE_KEY = "roboarxiv:read-days:v1";
const READ_DAY_TEXT = {
    readTitle: "标记为未读",
    unreadTitle: "标记为已读",
};

function loadReadDays() {
    try {
        const raw = localStorage.getItem(READ_DAYS_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }
        const normalized = {};
        Object.keys(parsed).forEach((key) => {
            if (typeof key === "string" && parsed[key] === true) {
                normalized[key] = true;
            }
        });
        return normalized;
    } catch (error) {
        return {};
    }
}

function saveReadDays(readDays) {
    try {
        localStorage.setItem(READ_DAYS_STORAGE_KEY, JSON.stringify(readDays));
    } catch (error) {
        // Ignore storage write errors to avoid blocking page interactions.
    }
}

function renderReadState(dayContainer, isRead) {
    dayContainer.dataset.read = isRead ? "true" : "false";
    const toggleButton = dayContainer.querySelector('[data-role="day-read-toggle"]');
    if (!toggleButton) {
        return;
    }
    const iconNode = toggleButton.querySelector("i");
    toggleButton.classList.toggle("day-read-toggle-read", isRead);
    toggleButton.classList.toggle("day-read-toggle-unread", !isRead);
    toggleButton.title = isRead ? READ_DAY_TEXT.readTitle : READ_DAY_TEXT.unreadTitle;
    toggleButton.setAttribute("aria-label", isRead ? READ_DAY_TEXT.readTitle : READ_DAY_TEXT.unreadTitle);
    toggleButton.setAttribute("aria-pressed", String(isRead));
    if (iconNode) {
        iconNode.className = isRead ? "ri-eye-line" : "ri-eye-off-line";
    }
}

function initReadDayTracking() {
    const dayContainers = document.querySelectorAll(".day-container[data-day]");
    if (!dayContainers.length) {
        return;
    }

    const readDays = loadReadDays();
    dayContainers.forEach((dayContainer) => {
        const dayKey = dayContainer.getAttribute("data-day");
        if (!dayKey) {
            return;
        }

        const toggleButton = dayContainer.querySelector('[data-role="day-read-toggle"]');
        if (!toggleButton) {
            return;
        }

        renderReadState(dayContainer, readDays[dayKey] === true);
        toggleButton.addEventListener("click", () => {
            const isRead = readDays[dayKey] === true;
            if (isRead) {
                delete readDays[dayKey];
            } else {
                readDays[dayKey] = true;
            }
            saveReadDays(readDays);
            renderReadState(dayContainer, !isRead);
        });
    });
}

initReadDayTracking();
