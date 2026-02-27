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
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById("theme-icon").className = "ri-sun-line";
        localStorage.setItem('theme', 'light'); //add this
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById("theme-icon").className = "ri-moon-line";
        localStorage.setItem('theme', 'dark'); //add this
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
        toggleSwitch.checked = true;
    }
}

const timestamp = document.getElementById("build-timestamp");
const timestamp_local = new Date(timestamp.getAttribute("datetime")).toLocaleString();

const badge = document.getElementById("build-timestamp-badge");
// badge.src = `https://img.shields.io/github/workflow/status/mlnlp-world/myarxiv/Update?=${timestamp_local}&style=for-the-badge`

/* Track read days */
const READ_DAYS_STORAGE_KEY = "roboarxiv:read-days:v1";
const READ_DAY_TEXT = {
    read: "已看",
    unread: "未看",
    markRead: "标记已看",
    markUnread: "取消已看",
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
    const statusNode = dayContainer.querySelector('[data-role="day-read-status"]');
    const toggleButton = dayContainer.querySelector('[data-role="day-read-toggle"]');
    if (!statusNode || !toggleButton) {
        return;
    }

    statusNode.textContent = isRead ? READ_DAY_TEXT.read : READ_DAY_TEXT.unread;
    statusNode.classList.toggle("day-read-status-read", isRead);
    statusNode.classList.toggle("day-read-status-unread", !isRead);

    toggleButton.textContent = isRead ? READ_DAY_TEXT.markUnread : READ_DAY_TEXT.markRead;
    toggleButton.setAttribute("aria-pressed", String(isRead));
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
