
/* NASA SPACE EXPLORER APP */

const API_KEY = window.NASA_API_KEY || "DEMO_KEY";
const API_URL = "https://api.nasa.gov/planetary/apod";
const galleryItemCount = 9;

// Get the HTML elements
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const loadButton = document.getElementById("loadImages");
const gallery = document.getElementById("galleryGrid");
const statusText = document.getElementById("status");

const modal = document.getElementById("imageModal");
const modalMedia = document.getElementById("modalMedia");
const modalDate = document.getElementById("modalDate");
const modalTitle = document.getElementById("modalTitle");
const modalExplanation = document.getElementById("modalExplanation");
const nasaLink = document.getElementById("nasaLink");

// Space facts for the fact section
const spaceFacts = [
    "A day on Venus is longer than its year.",
    "Jupiter is the largest planet in our solar system.",
    "The Sun contains about 99.8% of the mass in our solar system.",
    "Saturn's rings are mostly made of ice and rock.",
    "Light from the Sun takes about eight minutes to reach Earth.",
    "Mars has the tallest volcano in our solar system, Olympus Mons.",
    "Neutron stars are incredibly dense.",
    "The Moon is slowly moving away from Earth.",
    "There are more stars in the universe than grains of sand on Earth."
];

/* SHOW A RANDOM SPACE FACT */

function showRandomFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);

    document.getElementById("spaceFact").textContent =
        spaceFacts[randomIndex];
}

/* LOAD THE NASA GALLERY */

async function loadImages() {
    const startDate = startInput.value;
    const endDate = endInput.value;

    if (!startDate || !endDate) {
        statusText.textContent = "Please choose both dates.";
        return;
    }

    if (startDate > endDate) {
        statusText.textContent =
            "The start date must be before the end date.";
        return;
    }

    const start = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");
    const daysApart = Math.round(
        (end.getTime() - start.getTime()) / 86400000
    );

    if (daysApart !== 8) {
        statusText.textContent =
            "Please select exactly nine consecutive days.";
        return;
    }

    const today = formatInputDate(new Date());

    if (startDate < earliestDate || endDate > today) {
        statusText.textContent =
            "Please choose dates between June 16, 1995 and today.";
        return;
    }

    gallery.innerHTML = "";
    statusText.textContent = "Loading pictures from NASA...";
    loadButton.disabled = true;

    try {
        const requestURL =
            `${API_URL}?api_key=${API_KEY}` +
            `&start_date=${startDate}` +
            `&end_date=${endDate}` +
            `&thumbs=true`;

        const response = await fetch(requestURL);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(
                    "NASA's request limit was reached. Please wait and try again."
                );
            }

            throw new Error(
                `NASA API error (${response.status}). Please try again.`
            );
        }

        const pictures = await response.json();

        if (!Array.isArray(pictures) || pictures.length !== galleryItemCount) {
            throw new Error(
                `NASA did not return all ${galleryItemCount} pictures for these dates.`
            );
        }

        pictures.forEach(picture => {
            createGalleryCard(picture);
        });

        statusText.textContent =
            `Showing ${pictures.length} NASA discoveries.`;

    } catch (error) {
        console.error("NASA API problem:", error);
        statusText.textContent = error.message;
    } finally {
        loadButton.disabled = false;
    }
}

/* CREATE EACH GALLERY CARD */

function createGalleryCard(item) {
    const card = document.createElement("article");
    card.className = "gallery-card";

    const imageArea = document.createElement("div");
    imageArea.className = "card-image-area";

    const isVideo = item.media_type === "video";

    // Show a video label when the NASA entry is a video.
    if (isVideo) {
        const badge = document.createElement("span");
        badge.className = "video-badge";
        badge.textContent = "VIDEO";
        imageArea.appendChild(badge);
    }

    const image = document.createElement("img");
    image.alt = item.title || "NASA space discovery";
    image.loading = "lazy";

    // NASA supplies thumbnail_url for many video entries.
    // Use a placeholder if no video thumbnail is available.
    if (isVideo) {
        image.src = item.thumbnail_url ||
            "https://placehold.co/600x400/294b70/ffffff?text=NASA+Video";
    } else {
        image.src = item.url;
    }

    image.onerror = function () {
        image.onerror = null;
        image.src =
            "https://placehold.co/600x400/294b70/ffffff?text=Space+Image";
    };

    imageArea.appendChild(image);

    const details = document.createElement("div");
    details.className = "card-details";

    const title = document.createElement("h3");
    title.textContent = item.title || "Space Discovery";

    const date = document.createElement("p");
    date.textContent = item.date || "";

    details.appendChild(title);
    details.appendChild(date);

    card.appendChild(imageArea);
    card.appendChild(details);

    // Clicking a card opens the detail window.
    card.addEventListener("click", function () {
        openModal(item);
    });

    gallery.appendChild(card);
}

/* OPEN THE DETAIL WINDOW */

function openModal(item) {
    modalMedia.innerHTML = "";

    if (item.media_type === "video") {
        const message = document.createElement("div");
        message.className = "video-message";

        const description = document.createElement("p");
        description.textContent =
            "This NASA entry is a video. Use the link below to watch it.";

        const videoLink = document.createElement("a");
        videoLink.href = item.url;
        videoLink.target = "_blank";
        videoLink.rel = "noopener noreferrer";
        videoLink.textContent = "Watch NASA Video";

        message.appendChild(description);
        message.appendChild(videoLink);
        modalMedia.appendChild(message);

    } else {
        const image = document.createElement("img");
        image.src = item.hdurl || item.url;
        image.alt = item.title || "NASA space image";

        modalMedia.appendChild(image);
    }

    modalDate.textContent = item.date || "";
    modalTitle.textContent = item.title || "Space Discovery";
    modalExplanation.textContent =
        item.explanation || "No description is available.";

    nasaLink.href =
        item.url || "https://apod.nasa.gov/apod/astropix.html";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

/* CLOSE THE DETAIL WINDOW */

function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});

/* BUTTON EVENTS */

loadButton.addEventListener("click", loadImages);

document.getElementById("newFact").addEventListener("click", showRandomFact);

/* START THE APP */

setupDateInputs(startInput, endInput);
showRandomFact();
loadImages();
