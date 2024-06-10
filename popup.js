const ImageDisplay = document.getElementById("show-image")
const FileInput = document.getElementById("fileInput")
const UploadButton = document.getElementById("uploadBtn")
const stars = document.querySelectorAll(".star")

const REPLICATE_API_KEY = "r8_Sffz2a3bolPhDDFn1SkhZ1cAfBXVo0s20gdG2"
const REPLICATE_API_URI = "https://api.replicate.com/v1/files"
const REPLICATE_HEADERS = {
    'Authorization': `Bearer ${REPLICATE_API_KEY}`,
    'Content-Type': 'multipart/form-data'
};
// const CLOUD_NAME = "du7hqfwso"
// const CLOUDINARY_BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
// const CLOUDINARY_API_KEY = "896567121931742"
// const CLOUDINARY_API_SECRET = "fmHx8YV_w_YxiadEULI5eOgutP4"
let files
FileInput.addEventListener("change", (event) => {
    files = event.target.files
    if(files.length > 0){
        // clear out previous result
        ImageDisplay.innerHTML = ``
        // Enable the button for upload
        UploadButton.disabled = false
        // Create a new image element to be inserted
        const img = document.createElement("img")
        // insert the file as the source for the image
        img.src = URL.createObjectURL(files[0])
        img.alt = "image"
        img.id = "selected-image"
        img.width = 230
        img.height = 200
        img.className="rounded-md"
        // Update the DOM
        ImageDisplay.appendChild(img)
    }
})

UploadButton.addEventListener("click", async () => {
    // check again if the image has been uploaded and the button is not disabled
    if(files.length === 0 || UploadButton.getAttribute("disabled")) return 
    // remove the content inside the buton
    UploadButton.innerHTML = ''
    // Add a spinner to notify the user that we are processing the request
    UploadButton.innerHTML = `
        <div class="flex justify-center gap-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-black text-base font-semibold"> processing... </p>
        </div>
    `
    // Disable the file input
    FileInput.disabled = true
    // chnage the opacity of the image
    const selectedImage = document.getElementById("selected-image")
    selectedImage.classList.add("opacity-75")
    // send the image to replica to be processed

})

let currentRating = 0;

stars.forEach((star, index) => {
    // For each star we're listening for a hover event to fire , then we will remove any existing hover effects and add a new one for each star
    star.addEventListener('mouseover', () => {
        resetStars();
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('hovered');
        }
    });

    // During Mouse out event we remove any hover effects from all stars using the resetStars function , then if the current rating is greater than 0, we will add the hover effect for thise special stars.
    star.addEventListener('mouseout', () => {
        resetStars();
        if (currentRating > 0 && currentRating >= 4) {
            for (let i = 0; i < currentRating; i++) {
                stars[i].classList.add('hovered');
            }
        }
        if(currentRating > 0 && currentRating <= 3){
            for (let i = 0; i < currentRating; i++) {
                stars[i].classList.add('red');
            }
        }
    });
    

    // Lisening to the click event  to redirect the user based on the rating
    star.addEventListener('click', () => {
        currentRating = index + 1;
        if (currentRating >= 4) {
            window.open("https://www.google.com/", "_blank");
        } 
        else if (currentRating <= 3) {
            for (let i = 0; i <= index; i++) {
                stars[i].classList.add('red');
            }
            window.open('https://www.youtube.com/hashtag/funnyvideo' , "_blank");
        }
    });
})

// A function that removes the hover and red property from each star by looping over them
function resetStars() {
    stars.forEach(star => {
        star.classList.remove('hovered');
        star.classList.remove('red')
    });
}