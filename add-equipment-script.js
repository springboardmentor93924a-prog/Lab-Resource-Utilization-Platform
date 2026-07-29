const pills = document.querySelectorAll(".pill");

pills.forEach((pill) => {

    pill.addEventListener("click", () => {

        pills.forEach((p) => {
            p.classList.remove("active-status");
        });

        pill.classList.add("active-status");

    });

});

const uploads = document.querySelectorAll(".upload-box input");

uploads.forEach((upload) => {

    upload.addEventListener("change", function () {

        if (this.files.length > 0) {

            const fileName = this.files[0].name;

            this.parentElement.querySelector("p").textContent = fileName;

        }

    });

});

const saveBtn = document.querySelector(".save");

saveBtn.addEventListener("click", () => {

    const equipmentName =
        document.querySelectorAll("input[type='text']")[0].value;

    if (equipmentName.trim() === "") {

        alert("Please enter Equipment Name.");

        return;
    }

    alert("Equipment saved successfully!");

});

const cancelBtn = document.querySelector(".cancel");

cancelBtn.addEventListener("click", () => {

    if (confirm("Clear all fields?")) {

        document.querySelectorAll("input").forEach((input) => {

            if (input.type !== "file") {

                input.value = "";

            }

        });

        document.querySelector("textarea").value = "";

        uploads.forEach((upload) => {

            upload.parentElement.querySelector("p").textContent =
                upload.parentElement.querySelector("p").textContent.includes("manual")
                    ? "Upload manual (PDF)"
                    : "Upload calibration certificate";

        });

        pills.forEach((p) => p.classList.remove("active-status"));

        pills[0].classList.add("active-status");

    }

});

const closeBtn = document.querySelector(".close-btn");

closeBtn.addEventListener("click", () => {

    if (confirm("Close this page?")) {

        window.history.back();

    }

});

const search = document.querySelector(".right input");

search.addEventListener("keyup", () => {

    console.log("Searching for:", search.value);

});