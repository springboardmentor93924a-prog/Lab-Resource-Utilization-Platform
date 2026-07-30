
document.addEventListener("DOMContentLoaded", () => {

    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".event").forEach(event => {

            if (event.innerText.toLowerCase().includes(value)) {
                event.style.display = "flex";
            } else {
                event.style.display = "none";
            }

        });

    });

    const filterBox = document.getElementById("filterEquipment");

    filterBox.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".event").forEach(event => {

            if (event.innerText.toLowerCase().includes(value)) {
                event.style.display = "flex";
            } else {
                event.style.display = "none";
            }

        });

    });

    const weekLabel = document.getElementById("weekLabel");

    const prevWeek = document.getElementById("prevWeek");

    const nextWeek = document.getElementById("nextWeek");

    let currentWeek = 22;

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let currentDate = new Date(2026, 6, 22); // July 22 2026

    function updateWeek() {

        const start = new Date(currentDate);

        const end = new Date(currentDate);

        end.setDate(start.getDate() + 6);

        weekLabel.innerHTML =
            `Week ${currentWeek} (${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]})`;

    }

    prevWeek.addEventListener("click", () => {

        currentWeek--;

        currentDate.setDate(currentDate.getDate() - 7);

        updateWeek();

    });

    nextWeek.addEventListener("click", () => {

        currentWeek++;

        currentDate.setDate(currentDate.getDate() + 7);

        updateWeek();

    });

    document.querySelectorAll(".event").forEach(event => {

        event.addEventListener("click", function () {

            document.querySelectorAll(".event").forEach(card => {

                card.classList.remove("active-event");

            });

            this.classList.add("active-event");

            alert(
                "Equipment Booking\n\n" +
                this.innerText
            );

        });

    });

    document.querySelectorAll(".event").forEach(event => {

        event.title = "Click to view booking details";

    });

    document.querySelectorAll(".day").forEach(day => {

        day.addEventListener("dblclick", () => {

            alert("Open Booking Form");

        });

    });

    document.addEventListener("keydown", function (e) {

        if (e.key === "ArrowLeft") {

            prevWeek.click();

        }

        if (e.key === "ArrowRight") {

            nextWeek.click();

        }

    });

    const today = new Date().getDay();

    const headers = document.querySelectorAll(".calendar-header div");

    let index;

    if (today === 0) {
        index = 6;
    } else {
        index = today - 1;
    }

    if (headers[index]) {

        headers[index].style.background = "#dbe8ff";
        headers[index].style.fontWeight = "700";

    }

    document.querySelectorAll(".event").forEach((event, index) => {

        event.style.opacity = "0";

        event.style.transform = "translateY(20px)";

        setTimeout(() => {

            event.style.transition = "0.5s";

            event.style.opacity = "1";

            event.style.transform = "translateY(0px)";

        }, index * 150);

    });

    console.log("Equipment Calendar Loaded Successfully");

});