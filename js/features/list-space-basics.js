document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("list-space-basics-form");

    const categoryOptions = document.querySelectorAll(
        ".category-option"
    );

    const activityOptions = document.querySelectorAll(
        ".activity-option"
    );

    const backButton = document.getElementById("back-button");
    const chatButton = document.getElementById("chat-button");

    const spaceNameInput = document.getElementById("space-name");
    const spaceNameError = document.getElementById("space-name-error");
    const categoryGroup = document.querySelector(".category-group");
    const categoryError = document.getElementById("category-error");
    const descriptionInput = document.getElementById(
        "space-description"
    );

    const descriptionError = document.getElementById(
        "description-error"
    );

    const progressTrack = document.querySelector(
        ".progress-track"
    );

    const progressSteps = document.querySelectorAll(
        ".progress-step"
    );

    const stepCount = document.querySelector(
        ".step-count"
    );

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



    updateProgress(1);

    const storedBasics = sessionStorage.getItem("spaceShareListingBasics");
    if (storedBasics) {
        try {
            const listingBasics = JSON.parse(storedBasics);
            if (listingBasics && typeof listingBasics === "object") {
                if (typeof listingBasics.spaceName === "string") spaceNameInput.value = listingBasics.spaceName;
                if (typeof listingBasics.description === "string") descriptionInput.value = listingBasics.description;

                const savedCategory = categoryOptions.find(
                    (option) => option.dataset.category === listingBasics.category
                );
                if (savedCategory) {
                    categoryOptions.forEach((option) => {
                        const selected = option === savedCategory;
                        option.classList.toggle("selected", selected);
                        option.setAttribute("aria-pressed", String(selected));
                        const box = option.querySelector(".selection-box");
                        if (box) box.textContent = selected ? "✓" : "";
                    });
                }

                if (Array.isArray(listingBasics.activities)) {
                    activityOptions.forEach((option) => {
                        const selected = listingBasics.activities.includes(option.dataset.activity);
                        option.classList.toggle("selected", selected);
                        option.setAttribute("aria-pressed", String(selected));
                        const box = option.querySelector(".selection-box");
                        if (box) box.textContent = selected ? "✓" : "";
                    });
                }
            }
        } catch (error) {
            // Keep the current form defaults when stored data is invalid.
        }
    }



    categoryOptions.forEach((option) => {
        option.addEventListener("click", () => {
            categoryOptions.forEach((item) => {
                const isSelected = item === option;

                item.classList.toggle(
                    "selected",
                    isSelected
                );

                item.setAttribute(
                    "aria-pressed",
                    String(isSelected)
                );

                const selectionBox =
                    item.querySelector(
                        ".selection-box"
                    );

                if (selectionBox) {
                    selectionBox.textContent =
                        isSelected ? "✓" : "";
                }
            });
        });
    });



    activityOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const isSelected =
                option.classList.toggle("selected");

            option.setAttribute(
                "aria-pressed",
                String(isSelected)
            );

            const selectionBox =
                option.querySelector(
                    ".selection-box"
                );

            if (selectionBox) {
                selectionBox.textContent =
                    isSelected ? "✓" : "";
            }
        });
    });



    if (backButton) {
        backButton.addEventListener("click", (event) => {
            event.preventDefault();

            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "../index.html";
            }
        });
    }

    if (chatButton) {
        chatButton.addEventListener("click", (event) => {
            event.preventDefault();

            window.alert(
                "Live chat will be connected when the support service is integrated."
            );
        });
    }


    spaceNameInput.addEventListener("input", () => {
        if (spaceNameInput.value.trim()) clearError(spaceNameInput, spaceNameError);
    });
    descriptionInput.addEventListener("input", () => {
        if (descriptionInput.value.trim()) clearError(descriptionInput, descriptionError);
    });
    categoryOptions.forEach((option) => option.addEventListener("click", () => clearError(categoryGroup, categoryError)));


    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();


            const spaceName =
                spaceNameInput?.value.trim() || "";

            const description =
                descriptionInput?.value.trim() || "";

            const selectedCategory =
                document.querySelector(
                    ".category-option.selected"
                )?.dataset.category || "";


            const selectedActivities =
                Array.from(
                    document.querySelectorAll(
                        ".activity-option.selected"
                    )
                ).map(
                    (activity) =>
                        activity.dataset.activity
                );



            if (!spaceName) {
                showError(spaceNameInput, spaceNameError, "Please enter a space name.");
                return;
            }


            if (!selectedCategory) {
                showError(categoryGroup, categoryError, "Please select a space category.");
                return;
            }


            if (!description) {
                showError(descriptionInput, descriptionError, "Please add a short description before continuing.");
                return;
            }

            clearError(spaceNameInput, spaceNameError);
            clearError(categoryGroup, categoryError);
            clearError(descriptionInput, descriptionError);

            const listingBasics = {
                spaceName,
                category: selectedCategory,
                activities: selectedActivities,
                description
            };



            sessionStorage.setItem(
                "spaceShareListingBasics",
                JSON.stringify(listingBasics)
            );


            console.log(
                "SpaceShare listing basics:",
                listingBasics
            );


            window.location.href = "./list-space-details.html";
        });
    }
});
