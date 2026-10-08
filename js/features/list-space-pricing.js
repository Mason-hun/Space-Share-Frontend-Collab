document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("list-space-pricing-form");
    const price = document.getElementById("price");
    const priceUnit = document.getElementById("price-unit");
    const rateButtons = Array.from(document.querySelectorAll("[data-rate]"));
    const dayInputs = Array.from(document.querySelectorAll(".day-options input"));
    const blockedInput = document.getElementById("blocked-date");
    const blockedList = document.getElementById("blocked-dates");
    const formMessage = document.getElementById("form-message");
    const progressTrack = document.querySelector(".progress-track");
    if (progressTrack) progressTrack.style.setProperty("--progress", "60%");
    const key = "spaceShareListingPricing";
    const state = { rate: "hourly", price: "15000", openTime: "08:00", closeTime: "19:00", days: [], bookingMode: "", blockedDates: [] };
    const parseISODate = (dateString) => {
        if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(0);
        date.setFullYear(year, month - 1, day);
        date.setHours(12, 0, 0, 0);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    };
    const formatDate = (dateString) => parseISODate(dateString)?.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) || dateString;
    function save() { sessionStorage.setItem(key, JSON.stringify(state)); }
    function renderBlockedDates() {
        blockedList.replaceChildren();
        state.blockedDates.forEach((date) => {
            const item = document.createElement("li"); item.className = "blocked-chip";
            const text = document.createElement("span"); text.textContent = formatDate(date);
            const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", `Remove ${formatDate(date)} from blocked dates`);
            remove.addEventListener("click", () => { state.blockedDates = state.blockedDates.filter((entry) => entry !== date); save(); renderBlockedDates(); });
            item.append(text, remove); blockedList.append(item);
        });
    }
    function setRate(rate) { state.rate = rate; rateButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.rate === rate))); priceUnit.textContent = rate === "hourly" ? "Per Hour" : "Per Day"; }
    try {
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        if (saved && typeof saved === "object") {
            if (["hourly", "daily"].includes(saved.rate)) state.rate = saved.rate;
            if (typeof saved.price === "string" || typeof saved.price === "number") state.price = String(saved.price);
            if (typeof saved.openTime === "string") state.openTime = saved.openTime;
            if (typeof saved.closeTime === "string") state.closeTime = saved.closeTime;
            if (Array.isArray(saved.days)) state.days = saved.days.filter((day) => dayInputs.some((input) => input.value === day));
            if (["instant", "approval"].includes(saved.bookingMode)) state.bookingMode = saved.bookingMode;
            if (Array.isArray(saved.blockedDates)) state.blockedDates = [...new Set(saved.blockedDates.filter((date) => parseISODate(date)))];
        }
    } catch (error) { /* Ignore invalid session data and retain defaults. */ }
    price.value = state.price; document.getElementById("open-time").value = state.openTime; document.getElementById("close-time").value = state.closeTime;
    dayInputs.forEach((input) => { input.checked = state.days.includes(input.value); });
    const savedBooking = document.querySelector(`input[name="booking-mode"][value="${state.bookingMode}"]`); if (savedBooking) savedBooking.checked = true;
    setRate(state.rate); renderBlockedDates();
    rateButtons.forEach((button) => button.addEventListener("click", () => { setRate(button.dataset.rate); save(); }));
    document.getElementById("add-blocked-date").addEventListener("click", () => {
        const value = blockedInput.value;
        if (!value) { blockedInput.focus(); return; }
        if (!parseISODate(value)) return;
        if (!state.blockedDates.includes(value)) state.blockedDates.push(value);
        state.blockedDates.sort(); blockedInput.value = ""; save(); renderBlockedDates();
    });
    [price, document.getElementById("open-time"), document.getElementById("close-time")].forEach((input) => input.addEventListener("input", () => { state.price = price.value; state.openTime = document.getElementById("open-time").value; state.closeTime = document.getElementById("close-time").value; save(); }));
    dayInputs.forEach((input) => input.addEventListener("change", () => { state.days = dayInputs.filter((day) => day.checked).map((day) => day.value); save(); }));
    document.querySelectorAll("input[name='booking-mode']").forEach((input) => input.addEventListener("change", () => { state.bookingMode = input.value; save(); }));
    document.getElementById("back-button").addEventListener("click", () => { save(); window.location.href = "./list-space-photos.html"; });
    document.getElementById("chat-button").addEventListener("click", () => { formMessage.textContent = "Live chat will be connected when the support service is integrated."; });
    form.addEventListener("submit", (event) => {
        event.preventDefault(); formMessage.textContent = "";
        const errors = { price: document.getElementById("price-error"), hours: document.getElementById("hours-error"), days: document.getElementById("days-error"), booking: document.getElementById("booking-error") };
        Object.values(errors).forEach((node) => { node.textContent = ""; });
        let firstInvalid;
        const amount = Number(price.value);
        if (!price.value.trim() || !Number.isFinite(amount) || amount <= 0) { errors.price.textContent = "Enter a price greater than zero."; firstInvalid ||= price; }
        const openTime = document.getElementById("open-time").value, closeTime = document.getElementById("close-time").value;
        if (!openTime || !closeTime || openTime >= closeTime) { errors.hours.textContent = "Closing time must be later than opening time."; firstInvalid ||= document.getElementById("open-time"); }
        const days = dayInputs.filter((input) => input.checked).map((input) => input.value);
        if (!days.length) { errors.days.textContent = "Select at least one day."; firstInvalid ||= dayInputs[0]; }
        const bookingMode = document.querySelector("input[name='booking-mode']:checked")?.value || "";
        if (!bookingMode) { errors.booking.textContent = "Choose how bookings should be confirmed."; firstInvalid ||= document.querySelector("input[name='booking-mode']"); }
        state.price = price.value; state.openTime = openTime; state.closeTime = closeTime; state.days = days; state.bookingMode = bookingMode;
        if (firstInvalid) { save(); firstInvalid.focus(); return; }
        save(); window.location.href = "./list-space-review.html";
    });
});
