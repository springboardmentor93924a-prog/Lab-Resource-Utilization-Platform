
console.log("Equipment Detail Loaded");


const bookButton = document.querySelector(".book-btn");

bookButton.addEventListener("click", () => {

    alert("Equipment booked successfully!");

});


const files = document.querySelectorAll(".file");

files.forEach(file=>{

    file.addEventListener("click",()=>{

        alert("Downloading " + file.innerText);

    });

});