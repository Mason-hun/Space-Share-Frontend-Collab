document.addEventListener("DOMContentLoaded", () => {
    const notProvided = "Not provided";
    const readRecord = (key) => {
        try {
            const value = JSON.parse(sessionStorage.getItem(key) || "null");
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        } catch (error) {
            return {};
        }
    };
    const basics = readRecord("spaceShareListingBasics");
    const details = readRecord("spaceShareListingDetails");
    const photos = readRecord("spaceShareListingPhotos");
    const pricing = readRecord("spaceShareListingPricing");

    const labels = {
        category: { "work-space": "Work Space", "creative-studio": "Content and Creative Studio", "meeting-space": "Meeting Space" },
        activities: { photoshoots: "Photoshoots", "video-shoot": "Video shoot", "podcast-audio": "Podcast & Audio", "client-meeting": "Client meeting", rehearsal: "Rehearsal", workshop: "Workshop", screening: "Screening", exhibition: "Exhibition" },
        amenities: { "natural-light": "Natural light", "backup-power": "Backup power", "wheelchair-access": "Wheelchair access", "air-conditioning": "Air conditioning", wifi: "Wi-Fi", parking: "Parking Space", "changing-room": "Changing room", restroom: "Restroom", "sound-system": "Sound System", "tv-projector": "Tv / Projector" },
        equipment: { microphones: "Microphones", backdrops: "Backdrops", props: "Props", "studio-lights": "Studio Lights", none: "No equipment" },
        city: { lagos: "Lagos", abuja: "Abuja", "port-harcourt": "Port Harcourt", ibadan: "Ibadan" },
        days: { Sun: "Sun", Mon: "Mon", Tues: "Tues", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat" }
    };

    const display = (value) => typeof value === "string" && value.trim() ? value.trim() : notProvided;
    const mapped = (value, map) => typeof value === "string" && map[value] ? map[value] : notProvided;
    const list = (value, map) => Array.isArray(value) && value.length
        ? value.map((item) => mapped(item, map)).join(", ")
        : notProvided;
    const set = (name, value) => document.querySelectorAll(`[data-review="${name}"]`).forEach((node) => { node.textContent = value; });

    const spaceName = display(basics.spaceName);
    document.getElementById("publish-success-space-name").textContent =
        spaceName === notProvided ? "your listing" : spaceName;
    const locationParts = [display(details.address), mapped(details.city, labels.city)].filter((part) => part !== notProvided);
    const location = locationParts.length ? locationParts.join(", ") : notProvided;
    set("spaceName", spaceName);
    set("category", mapped(basics.category, labels.category));
    set("activities", list(basics.activities, labels.activities));
    set("description", display(basics.description));
    set("location", location);

    const capacity = Number(details.capacity);
    set("capacity", Number.isFinite(capacity) && capacity > 0 ? `${capacity} people` : notProvided);
    set("amenities", list(details.amenities, labels.amenities));
    set("equipment", list(details.equipment, labels.equipment));

    const rateLabels = { hourly: "Per Hour", daily: "Per Day" };
    const amount = Number(pricing.price);
    const formattedAmount = Number.isFinite(amount) && amount > 0
        ? new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(amount)
        : "";
    const rate = rateLabels[pricing.rate] && formattedAmount ? `₦${formattedAmount} ${rateLabels[pricing.rate]}` : notProvided;
    set("rate", rate);
    set("days", list(pricing.days, labels.days));

    const formatTime = (value) => {
        if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
        const [hour, minute] = value.split(":").map(Number);
        const suffix = hour >= 12 ? "pm" : "am";
        return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")}${suffix}`;
    };
    const openTime = formatTime(pricing.openTime);
    const closeTime = formatTime(pricing.closeTime);
    set("hours", openTime && closeTime ? `${openTime} - ${closeTime}` : notProvided);

    const formatDate = (value) => {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
            ? null
            : date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    };
    const blockedDates = Array.isArray(pricing.blockedDates)
        ? pricing.blockedDates.map(formatDate).filter(Boolean)
        : [];
    set("blockedDates", blockedDates.length ? blockedDates.join(", ") : notProvided);

    const confirmation = document.getElementById("confirm-listing");
    const message = document.getElementById("review-message");
    const reviewForm = document.getElementById("review-form");
    const publishButton = reviewForm.querySelector(".publish-button");
    const successDialog = document.getElementById("publish-success-dialog");
    const successTitle = document.getElementById("publish-success-title");
    reviewForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!confirmation.checked) {
            message.textContent = "Please confirm that your listing information is accurate.";
            confirmation.focus();
            return;
        }
        message.textContent = "";
        successDialog.showModal();
        successTitle.focus();
    });

    document.getElementById("chat-button").addEventListener("click", () => {
        message.textContent = "Live chat will be connected when the support service is integrated.";
    });

    successDialog.addEventListener("close", () => publishButton.focus());
    document.getElementById("publish-support-chat").addEventListener("click", () => {
        document.getElementById("publish-support-message").textContent = "Live chat will be connected when the support service is integrated.";
    });
});
