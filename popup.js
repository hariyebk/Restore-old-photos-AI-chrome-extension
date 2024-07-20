const FileInput = document.getElementById("fileInput")
const dropZone = document.getElementById("dropzone")
const dragAndDropContainer = document.getElementById("draganddrop")
const tokenInput = document.getElementById("token")
const enhance = document.getElementById("enhance")
const upsample = document.getElementById("upsample")
const fidelityInput = document.getElementById("fidelity")
const upscaleInput = document.getElementById("upscale")
const UploadButton = document.getElementById("uploadBtn")
const settingBtn = document.getElementById("setting")
const closBtn = document.getElementById("close")
const saveBtn = document.getElementById("save")
const timer = document.getElementById("timer")
const popupWindow = document.getElementById("popup")
const fidelityError = document.getElementById("fidelity-message")
const operationError = document.getElementById("operation-error")
const starContainer = document.getElementById("star-widget")
const stars = document.querySelectorAll(".star")
const previewContainer = document.getElementById("preview")
const closeRedBtn = document.getElementById("closered")
const downloadBtn = document.getElementById("download")
const container = document.querySelector(".container")
const imageContainer = document.getElementById('imageContainer')
const before = document.getElementById("before")
const after = document.getElementById("after")
const expand = document.getElementById("exapnd")

let files, seconds = 0, timerInterval = null , generatedImage = '', sliderP


dropZone.addEventListener("click", () => {
    FileInput.click()
})

dragAndDropContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dragAndDropContainer.classList.remove('border-button')
    dragAndDropContainer.classList.add('border-green-600')
})

dragAndDropContainer.addEventListener('dragleave', () => {
    dragAndDropContainer.classList.remove('border-green-600');
    dragAndDropContainer.classList.add('border-button')
})

dragAndDropContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    dragAndDropContainer.classList.remove('border-green-600');
    dragAndDropContainer.classList.add('border-button')
    const droppedFiles = e.dataTransfer.files;
    files = droppedFiles
    handleFile(droppedFiles)
});

FileInput.addEventListener("change", (event) => {
    files = event.target.files
    if(files.length > 0){
        handleFile(files)
    }
})

UploadButton.addEventListener("click", async () => {
    // check again if the image has been uploaded and the button is not disabled
    if(files.length === 0 || UploadButton.getAttribute("disabled")) return 
    // check if the fidelity prompt is provided and is a correct number
    const fidelity = fidelityInput.value
    if(fidelity){
        const fidelityNumber = parseInt(fidelity)
        if(fidelityNumber > 1 || fidelityNumber < 0){
            fidelityError.innerHTML= `
                <p class="text-red-500 text-sm font-semibold"> invalid number </p>
            `
            return
        }
        else{
            // Clear if there is no error
            fidelityError.innerHTML = ``

        }
    }
    startTimer()
    // clear if there were any previous errors.
    operationError.innerHTML = ``
    // disable the upload button
    UploadButton.disabled = true
    // remove the content inside the buton
    UploadButton.innerHTML = ''
    // Disable the file fields and the stars
    FileInput.disabled = true
    fidelityInput.disabled = true
    upscaleInput.disabled = true
    settingBtn.disabled = true
    dropZone.disabled = true

    if(!starContainer.classList.contains("hidden")){
        starContainer.classList.add("hidden")
    }
    // store the fidelity and upscale value in the local storage
    chrome.storage.local.set({ userData: {
        fidelity,
        upscale: upscaleInput.value,
    }}, function() {
        console.log('config numbers saved locally');
    });
    
    const form = new FormData()
    form.set("file", files[0])
    form.set("fidelity", fidelity)
    form.set("upscale", upscaleInput.value)
    form.set("enhance", enhance.value)
    form.set("upsample", upsample.value)
    form.set("token", tokenInput.value.trim())

    try{
        if(tokenInput.value){
            const token = tokenInput.value.trim()
            UploadButton.innerHTML = `
            <div class="flex justify-center gap-2">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-black text-base font-semibold"> verifying token... </p>
            </div>
            `
            const response = await fetch("http://localhost:3000/api/restore/verifyToken", {
                method: "POST",
                body: JSON.stringify({
                    token: token || null
                })
            })
            const data = await response.json()
            if(data.error){
                throw new Error(data.error)
            }
        }
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
        // Create a post request to the proxy server by sending the image
        const response1 =  await fetch("http://localhost:3000/api/restore/create-prediction", {
            method: "POST",
            body: form
        })
        const data1 = await response1.json()
        if(data1.error){
            console.log(data1.error)
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
        // wait for 15 seconds 
        await delay(40000)
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
        const response2 = await fetch("http://localhost:3000/api/restore/get-prediction", {
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
        const {output} = data2
        console.log(`output`, output)
        // retrieve the first result from the outputs
        const imageURL = output.replaceAll("'", "")
        console.log(`result`, imageURL )
        generatedImage = imageURL
        stopTimer()
        // open it in a new tab
        // window.open(imageURL, "_blank");

        // create an image element
        const img = document.createElement('img')
        const div = document.createElement('div')
        img.src = imageURL
        img.alt = 'restored image'
        img.width = 300
        img.height = 150
        img.classList.add("object-contain")
        
        div.innerHTML = `
            <div class="grid place-content-center relative overflow-hidden">
                <div class="image-container">
                    <img src=${files[0]} alt="original-image" class="" />
                    ${img.outerHTML}
                </div>
                <input type="range" min="0" max="100" value="50" class="" aria-label="image comparison slider" />
                <div class="slider-line"> </div>
                <div class="slider-button" aria-hidden="true"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#dfdfd7" viewBox="0 0 256 256"><path d="M136,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0ZM96,120H35.31l18.35-18.34A8,8,0,0,0,42.34,90.34l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L35.31,136H96a8,8,0,0,0,0-16Zm149.66,2.34-32-32a8,8,0,0,0-11.32,11.32L220.69,120H160a8,8,0,0,0,0,16h60.69l-18.35,18.34a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,245.66,122.34Z"></path></svg>
                </div>
            </div>
        `
        // append the preview container
        previewContainer.appendChild(div)
        // show the preview section
        previewContainer.classList.remove("hidden")
    }
    catch(error){
        // display the error
        operationError.innerHTML = `
        <p class="text-red-500 text-sm font-semibold mt-3"> ${error.message ? error.message : "something went wrong"} </p>
        `
        stopTimer()
        console.log(error)
    }
    finally{
        // Enable the input fields
        FileInput.disabled = false
        fidelityInput.disabled = false
        upscaleInput.disabled = false
        tokenInput.disabled = false
        UploadButton.disabled = false
        settingBtn.disabled = false
        dropZone.disabled = false
        // return the upload button state to the original
        UploadButton.innerHTML = `
        <p class="text-base text-black font-semibold"> Start </p>
        `
        // Show the rating If the user hasn't rated before.
        chrome.storage.local.get("rating", function(result){
            if(!result.rating){
                starContainer.classList.remove("hidden")
            }
            else return
        })
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

// Litsening for the user to open our extension , then we will load the data from the storage.
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('userData', function(result) {
        if (result.userData) {
            const data = result.userData
            fidelityInput.value = data.fidelity
            upscaleInput.value = data.upscale
        } 
    });
    chrome.storage.local.get("rating", function(result){
        if(result.rating){
            // hide the rating section from the DOM
            starContainer.classList.add("hidden")
        }
        else{
            console.log("No previous rating found")
        }
    })
    chrome.storage.local.get('image', function(result){
        if(result.image){
            // loading the stored image to the input field
            const base64Data = result.image.value;
            // extracting the MIME type from Base64 string
            const mimeType = base64Data.match(/^data:(.*?);base64,/)[1]
            const imageBlob = base64ToBlob(base64Data, mimeType);
            const imageFile = blobToFile(imageBlob, result.image.name);
            const returnedFileArray = setConvertedFileToVariable(imageFile)
            if(returnedFileArray.length > 0){
                UploadButton.disabled = false
                dropZone.textContent = returnedFileArray[0].name
            }
        }
    })
}) 

// open the popup window
settingBtn.addEventListener("click", () => {
    popupWindow.classList.remove("hidden")
    chrome.storage.local.get('config', function(result) {
        if(result.config){
            enhance.value = result.config.enhance || "true"
            upsample.value = result.config.upsample || "true"
        }
        else return
    });
})

// close the popup window
closBtn.addEventListener("click", () => {
    popupWindow.classList.add("hidden")
})

// save the API token to the local storage
saveBtn.addEventListener("click", () => {
    console.log(`enhanceValue`, enhance.value)
    console.log(`upsampleValue`, upsample.value)

    chrome.storage.local.set({ config: {
        enhance: enhance.value ,
        upsample: upsample.value
    }}, function() {
        console.log("configuration setting saved locally")
    });
    popupWindow.classList.add("hidden")
})

// close the preview section
closeRedBtn.addEventListener("click", () => {
    previewContainer.classList.add("hidden")
})

// download the restored image
downloadBtn.addEventListener("click", () => {
    chrome.downloads.download({
        url: generatedImage,
        filename: 'restored-image.png'
    }, (downloadItem) => {
        if (chrome.runtime.lastError) {
            console.error('Error downloading the image:', chrome.runtime.lastError.message);
        } 
        else {
            console.log('Image download started:', downloadItem);
        }
    });
})

// A function that counts seconda 
function startTimer(){
    timerInterval = setInterval(() => {
        seconds++;
        timer.innerHTML = `<p class="text-primary text-base"> ${seconds} sec </p>`;
    }, 1000)
}

// A function that stops the time
function stopTimer(){
    clearInterval(timerInterval)
    timer.classList.add('hidden')
}

// A function that stores the image in local storage as Base64 string
function storeImage(file) {
    const reader = new FileReader();
    // reads and coverts the image data as Base64 string
    reader.onload = function(event) {
        const base64string = event.target.result;
        chrome.storage.local.set({image: {
            value: base64string,
            name: file.name
        }}, function() {
            if (chrome.runtime.lastError) {
                console.error('Error storing image:', chrome.runtime.lastError);
            } else {
                console.log('Image stored successfully');
            }
        });
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
}

// A function that converts a Base64 data to blob data
function base64ToBlob(base64, mimeType) {
    // decoding the Base64 string
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
}

// A function that converts blob data into a file
function blobToFile(blob, fileName) {
    return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
}

function setConvertedFileToVariable(image){
    files = [image]
    return files
}

function handleFile(files){
    storeImage(files[0])
    UploadButton.disabled = false
    // clear if there were any errors on the previous result
    operationError.innerHTML = ``
    dropZone.textContent = files[0].name
}

// listening for the sliding event
document.querySelector(".slider").addEventListener("input", (e) => {
    const position = e.target.value
    container.style.setProperty('--position', `${position}%`)
    if(parseInt(position) <= 10){
        if(after.classList.contains('hidden')){
            after.classList.remove('hidden')
        }
        if(!before.classList.contains('hidden')){
            before.classList.add('hidden')
        }
    }
    if(parseInt(position) >= 90){
        if(before.classList.contains('hidden')){
            before.classList.remove('hidden')
        }
        if(!after.classList.contains('hidden')){
            after.classList.add('hidden')
        }
    }
})

previewContainer.addEventListener('mouseenter', () => {
    before.classList.add('hidden')
    after.classList.add('hidden')
})

previewContainer.addEventListener('mouseleave', () => {
    before.classList.remove('hidden')
    after.classList.remove('hidden')
})

expand.addEventListener("click", () => {
    // send a message to open a new window
    chrome.runtime.sendMessage({action: 'expand'});
    // close the current popup
    window.close()
})