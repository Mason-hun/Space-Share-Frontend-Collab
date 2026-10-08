document.addEventListener("DOMContentLoaded", () => {
    const MAX_PHOTOS = 12;
    const MIN_WIDTH = 1200;
    const state = {
        photos: [],
        coverIndex: -1,
        checklist: [true, true, false, false],
        dragIndex: -1
    };
    const input = document.getElementById("photo-input");
    const grid = document.getElementById("photo-grid");
    const coverPreview = document.getElementById("cover-preview");
    const coverEmpty = document.getElementById("cover-empty");
    const coverBadge = document.getElementById("cover-badge");
    const coverFilename = document.getElementById("cover-filename");
    const deleteButton = document.getElementById("delete-cover");
    const message = document.getElementById("photo-message");
    const saveMessage = document.getElementById("save-message");
    const checklistButtons = Array.from(document.querySelectorAll(".checklist-item"));
    let isProcessingFiles = false;
    const progressTrack = document.querySelector(".progress-track");
    const progressSteps = document.querySelectorAll(".progress-step");
    const stepCount = document.querySelector(".step-count");

    function updateProgress(currentStep) {
        const totalSteps = progressSteps.length;
        if (!progressTrack || !totalSteps) return;
        const progress = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 80 : 0;
        progressTrack.style.setProperty("--progress", `${progress}%`);
        progressSteps.forEach((step, index) => {
            step.classList.toggle("active", index + 1 === currentStep);
            step.classList.toggle("completed", index + 1 < currentStep);
        });
        if (stepCount) stepCount.textContent = `Step ${currentStep} of ${totalSteps} :`;
    }

    function showError(text) { message.textContent = text; }
    function clearError() { message.textContent = ""; }

    function updateCover() {
        const photo = state.photos[state.coverIndex];
        const hasPhoto = Boolean(photo);
        coverPreview.hidden = !hasPhoto;
        coverEmpty.hidden = hasPhoto;
        coverBadge.hidden = !hasPhoto;
        coverFilename.hidden = !hasPhoto;
        deleteButton.disabled = !hasPhoto;
        if (photo) {
            coverPreview.src = photo.url;
            coverPreview.alt = `Cover photo: ${photo.name}`;
            coverFilename.textContent = photo.name;
        } else {
            coverPreview.removeAttribute("src");
            coverPreview.alt = "";
            coverFilename.textContent = "";
        }
    }

    function renderPhotos() {
        grid.replaceChildren();
        state.photos.forEach((photo, index) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "photo-card";
            card.draggable = true;
            card.dataset.index = String(index);
            card.setAttribute("aria-pressed", String(index === state.coverIndex));
            card.setAttribute("aria-label", `${photo.name}${index === state.coverIndex ? ", cover photo" : ", make cover photo"}. Drag to reorder.`);
            const image = document.createElement("img");
            image.src = photo.url;
            image.alt = "";
            const handle = document.createElement("span");
            handle.className = "drag-handle";
            handle.setAttribute("aria-hidden", "true");
            handle.textContent = "⠿";
            card.append(image, handle);
            card.addEventListener("click", () => setCover(index));
            card.addEventListener("dragstart", (event) => {
                state.dragIndex = index;
                card.classList.add("is-dragging");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
            });
            card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
            card.addEventListener("dragover", (event) => { event.preventDefault(); card.classList.add("is-drop-target"); });
            card.addEventListener("dragleave", () => card.classList.remove("is-drop-target"));
            card.addEventListener("drop", (event) => {
                event.preventDefault();
                card.classList.remove("is-drop-target");
                const from = Number(event.dataTransfer.getData("text/plain"));
                reorderPhotos(from, index);
            });
            grid.append(card);
        });

        for (let index = 0; index < Math.max(0, 3 - state.photos.length); index += 1) {
            const placeholder = document.createElement("div");
            placeholder.className = "photo-placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            const placeholderImage = document.createElement("img");
            placeholderImage.src = "../assets/images/vectors3/small-cover.png";
            placeholderImage.alt = "";
            placeholder.append(placeholderImage);
            grid.append(placeholder);
        }
        if (state.photos.length < MAX_PHOTOS) {
            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.className = "add-photo-card";
            addButton.setAttribute("aria-label", `Add photos, ${MAX_PHOTOS - state.photos.length} slots remaining`);
            const addIcon = document.createElement("img");
            addIcon.src = "../assets/images/vectors3/add-cover.png";
            addIcon.alt = "";
            addIcon.setAttribute("aria-hidden", "true");
            addButton.append(addIcon);
            addButton.addEventListener("click", () => input.click());
            grid.append(addButton);
        }
        updateCover();
    }

    function setCover(index) {
        if (index < 0 || index >= state.photos.length) return;
        state.coverIndex = index;
        renderPhotos();
        saveListingPhotos();
    }

    function reorderPhotos(from, to) {
        if (!Number.isInteger(from) || from < 0 || from >= state.photos.length || to < 0 || to >= state.photos.length || from === to) return;
        const cover = state.photos[state.coverIndex];
        const [photo] = state.photos.splice(from, 1);
        state.photos.splice(to, 0, photo);
        state.coverIndex = state.photos.indexOf(cover);
        renderPhotos();
        saveListingPhotos();
    }

    function removePhoto(index) {
        if (index < 0 || index >= state.photos.length) return;
        const [removed] = state.photos.splice(index, 1);
        URL.revokeObjectURL(removed.url);
        if (!state.photos.length) state.coverIndex = -1;
        else if (index === state.coverIndex) state.coverIndex = Math.min(index, state.photos.length - 1);
        else if (index < state.coverIndex) state.coverIndex -= 1;
        renderPhotos();
        saveListingPhotos();
    }

    function validateFile(file) {
        return new Promise((resolve) => {
            if (!["image/jpeg", "image/png"].includes(file.type)) {
                resolve({ error: `${file.name}: choose a JPG or PNG image.` });
                return;
            }
            const url = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image.naturalWidth >= MIN_WIDTH
                    ? { file }
                    : { error: `${file.name}: images must be at least ${MIN_WIDTH}px wide.` });
            };
            image.onerror = () => { URL.revokeObjectURL(url); resolve({ error: `${file.name}: this image could not be read.` }); };
            image.src = url;
        });
    }

    async function addPhotos(files) {
        clearError();
        if (isProcessingFiles) {
            showError("Please wait for the selected photos to finish checking.");
            input.value = "";
            return;
        }
        const incoming = Array.from(files);
        const available = MAX_PHOTOS - state.photos.length;
        if (!available) { showError("You can add up to 12 photos."); input.value = ""; return; }
        const candidates = incoming.slice(0, available);
        isProcessingFiles = true;
        try {
            const results = await Promise.all(candidates.map(validateFile));
            const errors = results.filter((result) => result.error).map((result) => result.error);
            results.filter((result) => result.file).forEach(({ file }) => {
                state.photos.push({ file, url: URL.createObjectURL(file), name: file.name });
            });
            if (incoming.length > available) errors.push(`Only ${available} more photo${available === 1 ? " is" : "s are"} allowed. Maximum is 12.`);
            if (state.coverIndex < 0 && state.photos.length) state.coverIndex = 0;
            renderPhotos();
            saveListingPhotos();
            if (errors.length) showError(errors.join(" "));
        } finally {
            isProcessingFiles = false;
            input.value = "";
        }
    }

    function updatePhotoCount() { return state.photos.length; }

    function saveListingPhotos() {
        const metadata = {
            photos: state.photos.map(({ name, file }) => ({ name, type: file.type, size: file.size })),
            coverIndex: state.coverIndex,
            checklist: [...state.checklist]
        };
        try { sessionStorage.setItem("spaceShareListingPhotos", JSON.stringify(metadata)); }
        catch (error) { showError("Photo metadata could not be saved in this browser session."); }
    }

    input.addEventListener("change", () => addPhotos(input.files));
    deleteButton.addEventListener("click", () => removePhoto(state.coverIndex));
    checklistButtons.forEach((button, index) => button.addEventListener("click", () => {
        state.checklist[index] = !state.checklist[index];
        button.classList.toggle("is-checked", state.checklist[index]);
        button.setAttribute("aria-pressed", String(state.checklist[index]));
        button.querySelector(".checkmark").textContent = state.checklist[index] ? "✓" : "";
        saveListingPhotos();
    }));
    document.getElementById("back-button").addEventListener("click", (event) => {
        event.preventDefault();
        // Use the flow's explicit previous step so direct page entry is predictable.
        window.location.href = "./list-space-details.html";
    });
    document.getElementById("chat-button").addEventListener("click", () => { saveMessage.textContent = "Live chat will be connected when the support service is integrated."; });
    document.getElementById("list-space-photos-form").addEventListener("submit", (event) => {
        event.preventDefault();
        saveListingPhotos();
        window.location.href = "./list-space-pricing.html";
    });
    window.addEventListener("beforeunload", () => state.photos.forEach((photo) => URL.revokeObjectURL(photo.url)));

    checklistButtons.forEach((button, index) => {
        button.classList.toggle("is-checked", state.checklist[index]);
        button.setAttribute("aria-pressed", String(state.checklist[index]));
        button.querySelector(".checkmark").textContent = state.checklist[index] ? "✓" : "";
    });
    try {
        const saved = JSON.parse(sessionStorage.getItem("spaceShareListingPhotos") || "null");
        if (Array.isArray(saved?.checklist) && saved.checklist.length === state.checklist.length) {
            state.checklist = saved.checklist.map(Boolean);
        }
    } catch (error) {
        // Keep the reference checklist defaults when stored state is invalid.
    }
    checklistButtons.forEach((button, index) => {
        button.classList.toggle("is-checked", state.checklist[index]);
        button.setAttribute("aria-pressed", String(state.checklist[index]));
        button.querySelector(".checkmark").textContent = state.checklist[index] ? "✓" : "";
    });
    updateProgress(3);
    renderPhotos();
    updatePhotoCount();
});
