
document.addEventListener("DOMContentLoaded", function () {

    const bookingForm = document.querySelector(".booking-section");

    const dateInput = document.querySelector('input[type="date"]');
    const timeInput = document.querySelector('input[type="time"]');
    const durationSelect = document.querySelector("select");

    const recurringCheckbox = document.querySelector('input[type="checkbox"]');
    const repeatInput = document.querySelector('input[type="number"]');

    const notes = document.querySelector("textarea");

    const waitlistBtn = document.querySelector(".waitlist");
    const cancelBtn = document.querySelector(".cancel");
    const nextBtn = document.querySelector(".next");

    const slots = document.querySelectorAll(".slot");

    const today = new Date().toISOString().split("T")[0];

    dateInput.min = today;

    repeatInput.disabled = true;



    recurringCheckbox.addEventListener("change", function () {

        repeatInput.disabled = !this.checked;

    });

    const counter = document.createElement("small");

    counter.innerHTML = "0 / 250";

    notes.parentElement.appendChild(counter);

    notes.maxLength = 250;



    notes.addEventListener("input", function () {

        counter.innerHTML = `${notes.value.length} / 250`;

    });

    durationSelect.addEventListener("change", function () {

        console.log("Selected Duration:", this.value);

    });

    slots.forEach(slot => {

        slot.addEventListener("click", function () {

            slots.forEach(s => s.classList.remove("selected"));

            this.classList.add("selected");

        });

    });

    waitlistBtn.addEventListener("click", function () {

        alert("You have been added to the waitlist.");

    });

    cancelBtn.addEventListener("click", function () {

        if (confirm("Cancel booking?")) {

            bookingForm.querySelectorAll("input").forEach(input => {

                if (input.type === "checkbox") {

                    input.checked = false;

                }
                else if (input.type !== "date") {

                    input.value = "";

                }

            });

            durationSelect.selectedIndex = 0;

            notes.value = "";

            counter.innerHTML = "0 / 250";

            repeatInput.disabled = true;

            slots.forEach(s => s.classList.remove("selected"));

        }

    });

    nextBtn.addEventListener("click", function () {

        if (dateInput.value === "") {

            alert("Please select booking date.");

            return;

        }

        if (timeInput.value === "") {

            alert("Please select start time.");

            return;

        }

        if (notes.value.trim() === "") {

            alert("Please enter purpose.");

            return;

        }

        alert(
            "Booking Successful!\n\n" +
            "Date : " + dateInput.value +
            "\nTime : " + timeInput.value +
            "\nDuration : " + durationSelect.value
        );

    });

    const search = document.querySelector(".search-box input");

    search.addEventListener("keyup", function () {

        console.log("Searching:", this.value);

    });

});