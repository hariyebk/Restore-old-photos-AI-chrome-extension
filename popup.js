const FileInput = document.getElementById("fileInput")
const promptInput = document.getElementById("prompt")
const tokenInput = document.getElementById("token")
const UploadButton = document.getElementById("uploadBtn")
const promptError = document.getElementById("prompt-message")
const operationError = document.getElementById("operation-error")
const starContainer = document.getElementById("star-widget")
const stars = document.querySelectorAll(".star")
const REPLICATE_API_URI = "https://api.replicate.com/v1/predictions"

let files
FileInput.addEventListener("change", (event) => {
    files = event.target.files
    if(files.length > 0){
        // Enable the button for upload
        UploadButton.disabled = false
        // clear if there were any errors on the previous result
        operationError.innerHTML = ``
    }
})

UploadButton.addEventListener("click", async () => {
    // check again if the image has been uploaded and the button is not disabled
    if(files.length === 0 || UploadButton.getAttribute("disabled")) return 
    // check if prompt is provided
    const prompt = promptInput.value
    if(!prompt){
        promptError.innerHTML= `
            <p class="text-red-500 text-sm font-semibold"> prompt is required </p>
        `
        return
    }
    else{
        // Clear if there is a prompt error
        promptError.innerHTML = ``
    }
    // clear if there were any previous errors.
    operationError.innerHTML = ``
    // disable the upload button
    UploadButton.disabled = true
    // remove the content inside the buton
    UploadButton.innerHTML = ''
    // Add a spinner to notify the user that we are processing the request
    UploadButton.innerHTML = `
        <div class="flex justify-center gap-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-black text-base font-semibold"> uploading... </p>
        </div>
    `
    // Disable the file fields and the stars
    FileInput.disabled = true
    promptInput.disabled = true
    tokenInput.disabled = true
    if(!starContainer.classList.contains("hidden")){
        starContainer.classList.add("hidden")
    }
    // store the prompt and token in the local storage
    chrome.storage.local.set({ userData: {
        prompt,
        token: tokenInput.value
    }}, function() {
        console.log('user data saved locally');
    });

    const form = new FormData()
    form.set("file", files[0])
    form.set("prompt", prompt)

    try{
        if(tokenInput.value){
            const response = await fetch("https://yegarabet.vercel.app/api/verifyToken", {
                method: "POST",
                body: JSON.stringify({
                    token: tokenInput.value
                })
            })
            const data = await response.json()
            if(data.error){
                throw new Error(data.error)
            }
        }
        // Create a post request to the proxy server by sending the image
        const response1 =  await fetch("https://yegarabet.vercel.app/api/create-prediction", {
            method: "POST",
            body: form
        })
        const data1 = await response1.json()
        if(data1.error){
            throw new Error(data1.error)
        }
        UploadButton.innerHTML = `
        <div class="flex justify-center gap-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-black text-base font-semibold"> processing... </p>
        </div>
    `
        // Get the prediction id from the proxy server
        const {predictionId} = data1
        // A function to delay the execution because we need to Wait for the model to finish processing the image, then making a request to get the results
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        // wait for 85 seconds 
        await delay(85000)
        UploadButton.innerHTML = `
        <div class="flex justify-center gap-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-black text-base font-semibold"> retrieving... </p>
        </div>
    `
        // make a get request to the proxy server again
        const response2 = await fetch("https://yegarabet.vercel.app/api/get-prediction", {
            method: "POST",
            body: JSON.stringify({
                predictionId,
                token: tokenInput.value 
            })
        })
        const data2 = await response2.json()
        // parse the response
        if(data2.error){
            throw new Error(data2.error)
        }
        const {outputs} = data2
        // retrieve the first result from the outputs
        const imageURL = outputs?.at(0).replaceAll("'", "")
        // open it in a new tab
        window.open(imageURL, "_blank");
    }
    catch(error){
        // display the error
        operationError.innerHTML = `
            <p class="text-red-500 text-sm font-semibold mt-3"> ${error.message ? error.message : "something went wrong"} </p>
        `
        console.error(error)
    }
    finally{
        // Enable the input fields
        FileInput.disabled = false
        promptInput.disabled = false
        tokenInput.disabled = false
        UploadButton.disabled = false
        // return the upload button state to the original
        UploadButton.innerHTML = `
        <p class="text-base text-black font-semibold"> Upload </p>
        `
        // show the rating again
        starContainer.classList.remove('hidden')
    }
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
    star.addEventListener('click', async () => {
        currentRating = index + 1;
        // store the rating to the local storage 
        chrome.storage.local.set({ rating: {
            status: true,
            currentRating
        }}, function(){
            console.log('current rating saved locally')
        });

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

// Litsening for the user to open our extension , then we will load the data from the storage to prompt and token of the last.
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('userData', function(result) {
        if (result.userData) {
            const data = result.userData
            promptInput.value = data.prompt
            if(data.token){
                tokenInput.value = data.token
            }
        } 
    });
    chrome.storage.local.get("rating", function(result){
        if(result.rating){
            // hide the rating section from the DOM
            starContainer.classList.add("hidden")
        }
        else return 
    })
}) 