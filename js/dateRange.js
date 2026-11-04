
/* DATE RANGE SETTINGS */

const earliestDate = "1995-06-16";

function formatInputDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function shiftDate(dateString, days) {
    const date = new Date(dateString + "T12:00:00");
    date.setDate(date.getDate() + days);

    return formatInputDate(date);
}

function setupDateInputs(startInput, endInput) {
    const today = formatInputDate(new Date());

    // The start date must allow eight more days after it.
    startInput.min = earliestDate;
    startInput.max = shiftDate(today, -8);

    // The end date must be at least eight days after the earliest date.
    endInput.min = shiftDate(earliestDate, 8);
    endInput.max = today;

    // Start with the most recent nine available days.
    startInput.value = shiftDate(today, -8);
    endInput.value = today;

    // Keep the dates exactly nine days apart.
    startInput.addEventListener("change", () => {
        if (!startInput.value) return;

        endInput.value = shiftDate(startInput.value, 8);
    });

    endInput.addEventListener("change", () => {
        if (!endInput.value) return;

        startInput.value = shiftDate(endInput.value, -8);
    });
}
