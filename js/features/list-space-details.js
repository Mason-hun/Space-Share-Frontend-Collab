document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("list-space-details-form");

    const addressInput = document.getElementById("space-address");
    const citySelect = document.getElementById("space-city");
    const addressError = document.getElementById("space-address-error");
    const cityError = document.getElementById("space-city-error");

    const decreaseButton = document.getElementById("capacity-decrease");
    const increaseButton = document.getElementById("capacity-increase");
    const capacityValue = document.getElementById("capacity-value");

    const amenityOptions =
        document.querySelectorAll(".amenity-option");

    const equipmentOptions =
        document.querySelectorAll(".equipment-option");

    const backButton = document.getElementById("back-button");
    const chatButton = document.getElementById("chat-button");

    const progressTrack =
        document.querySelector(".progress-track");

    const progressSteps =
        document.querySelectorAll(".progress-step");

    const stepCount =
        document.querySelector(".step-count");

    function showError(control, error, message) {
        error.textContent = message;
        error.hidden = false;
        control.setAttribute("aria-invalid", "true");
        control.focus();
    }

    function clearError(control, error) {
        error.textContent = "";
        error.hidden = true;
        control.removeAttribute("aria-invalid");
    }

    addressInput?.addEventListener("input", () => {
        if (addressInput.value.trim()) clearError(addressInput, addressError);
    });
    citySelect?.addEventListener("change", () => {
        if (citySelect.value) clearError(citySelect, cityError);
    });


    function updateProgress(currentStep) {
        const totalSteps = progressSteps.length;

        if (!progressTrack || !totalSteps) {
            return;
        }

        const progress = totalSteps > 1
            ? ((currentStep - 1) / (totalSteps - 1)) * 80
            : 0;

        progressTrack.style.setProperty(
            "--progress",
            `${progress}%`
        );

        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;

            step.classList.toggle(
                "active",
                stepNumber === currentStep
            );

            step.classList.toggle(
                "completed",
                stepNumber < currentStep
            );
        });

        if (stepCount) {
            stepCount.textContent =
                `Step ${currentStep} of ${totalSteps} :`;
        }
    }

    updateProgress(2);


    let capacity = Number(capacityValue?.textContent) || 1;

    // Restore Step 2 values when returning from Photos or refreshing the page.
    try {
        const saved = JSON.parse(sessionStorage.getItem("spaceShareListingDetails") || "null");
        if (saved && typeof saved === "object") {
            if (addressInput && typeof saved.address === "string") addressInput.value = saved.address;
            if (citySelect && typeof saved.city === "string") citySelect.value = saved.city;
            if (Number.isFinite(Number(saved.capacity)) && Number(saved.capacity) >= 1) capacity = Number(saved.capacity);
            amenityOptions.forEach((option) => {
                const selected = Array.isArray(saved.amenities) && saved.amenities.includes(option.dataset.amenity);
                option.classList.toggle("selected", selected);
                option.setAttribute("aria-pressed", String(selected));
            });
            equipmentOptions.forEach((option) => {
                const selected = Array.isArray(saved.equipment) && saved.equipment.includes(option.dataset.equipment);
                option.classList.toggle("selected", selected);
                option.setAttribute("aria-pressed", String(selected));
                const box = option.querySelector(".selection-box");
                if (box) box.textContent = selected ? "✓" : "";
            });
        }
    } catch (error) {
        // Ignore invalid session data and keep the page defaults.
    }

    function updateCapacity() {
        if (capacityValue) {
            capacityValue.textContent = capacity;
        }

        if (decreaseButton) {
            decreaseButton.disabled = capacity <= 1;
        }
    }

    decreaseButton?.addEventListener("click", () => {
        if (capacity > 1) {
            capacity -= 1;
            updateCapacity();
        }
    });

    increaseButton?.addEventListener("click", () => {
        capacity += 1;
        updateCapacity();
    });

    updateCapacity();



    amenityOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const isSelected =
                option.classList.toggle("selected");

            option.setAttribute(
                "aria-pressed",
                String(isSelected)
            );
        });
    });


    equipmentOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const isSelected =
                option.classList.toggle("selected");

            option.setAttribute(
                "aria-pressed",
                String(isSelected)
            );

            const selectionBox = option.querySelector(".selection-box");
            if (selectionBox) {
                selectionBox.textContent = isSelected ? "✓" : "";
            }
        });
    });



    backButton?.addEventListener("click", (event) => {
        event.preventDefault();

        window.location.href =
            "list-space-basics.html";
    });



    chatButton?.addEventListener("click", (event) => {
        event.preventDefault();

        window.alert(
            "Live chat will be connected when the support service is integrated."
        );
    });



    form?.addEventListener("submit", (event) => {
        event.preventDefault();

        const address =
            addressInput?.value.trim() || "";

        const city =
            citySelect?.value || "";

        const selectedAmenities =
            Array.from(amenityOptions)
                .filter((option) =>
                    option.classList.contains("selected")
                )
                .map((option) =>
                    option.dataset.amenity
                );

        const selectedEquipment =
            Array.from(equipmentOptions)
                .filter((option) =>
                    option.classList.contains("selected")
                )
                .map((option) =>
                    option.dataset.equipment
                );

        if (!address) {
            showError(addressInput, addressError, "Please enter the space address.");
            return;
        }

        if (!city) {
            showError(citySelect, cityError, "Please select a city.");
            return;
        }

        clearError(addressInput, addressError);
        clearError(citySelect, cityError);

        const listingDetails = {
            address,
            city,
            capacity,
            amenities: selectedAmenities,
            equipment: selectedEquipment
        };

        sessionStorage.setItem(
            "spaceShareListingDetails",
            JSON.stringify(listingDetails)
        );

        console.log(
            "SpaceShare listing details:",
            listingDetails
        );

        window.location.href = "list-space-photos.html";
    });
});
