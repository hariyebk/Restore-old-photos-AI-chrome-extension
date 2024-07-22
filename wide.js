const FileInput = document.getElementById("fileInput")
const dropZone = document.getElementById("dropzone")
const dragAndDropContainer = document.getElementById("draganddrop")
const tokenInput = document.getElementById("token")
const enhance = document.getElementById("enhance")
const upsample = document.getElementById("upsample")
const UploadButton = document.getElementById("uploadBtn")
const settingBtn = document.getElementById("setting")
const closBtn = document.getElementById("close")
const saveBtn = document.getElementById("save")
const timer = document.getElementById("timer")
const popupWindow = document.getElementById("popup")
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
const FidelityRange = document.getElementById("fidelity-range")
const FidelityValue = document.getElementById("fidelity-value")
const upscaleRange = document.getElementById("upscale-range")
const upscaleValue = document.getElementById("upscale-value")
const mainContainer = document.getElementById("mainContainer")

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
    if(files.length === 0) return 
    startTimer()
    // clear if there were any previous errors.
    operationError.innerHTML = ``
    // disable the upload button
    UploadButton.disabled = true
    // Disable the file fields and the stars
    FileInput.disabled = true
    FidelityRange.disabled = true
    FidelityValue.disabled = true
    upscaleRange.disabled = true
    upscaleValue.disabled = true
    settingBtn.disabled = true
    dropZone.disabled = true

    if(!starContainer.classList.contains("hidden")){
        starContainer.classList.add("hidden")
    }
    // store the fidelity and upscale value in the local storage
    chrome.storage.local.set({ userData: {
        fidelity: FidelityRange.value,
        upscale: upscaleRange.value,
    }}, function() {
        console.log('config numbers saved locally');
    });
    
    const form = new FormData()
    form.set("file", files[0])
    form.set("fidelity", FidelityRange.value)
    form.set("upscale", upscaleRange.value)
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
            const response = await fetch("https://yegarabet.vercel.app/api/restore/verifyToken", {
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
        const response1 =  await fetch("https://yegarabet.vercel.app/api/restore/create-prediction", {
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
        await delay(15000)
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
        const response2 = await fetch("https://yegarabet.vercel.app/api/restore/get-prediction", {
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
        // retrieve the first result from the outputs
        const imageURL = output.replaceAll("'", "")
        generatedImage = imageURL
        stopTimer()
        // open it in a new tab
        // window.open(imageURL, "_blank");

        const reader = new FileReader()
        reader.onload = function(e){
            // create an image element
            const newimg = document.createElement('img');
            newimg.src = imageURL
            newimg.alt = 'restored image'
            newimg.className = "image-after slider-image w-full h-full object-cover object-center"
    
            const oldimg = document.createElement('img')
            oldimg.src = e.target.result
            oldimg.alt = "original image"
            oldimg.className = "image-before slider-image"
    
            const div = document.createElement('div')
    
            div.innerHTML = `
                <div class="w-[600px] h-[350px]">
                    ${oldimg.outerHTML}
                    ${newimg.outerHTML}
                </div>
            `
            // append the image container
            imageContainer.appendChild(div)
            // hide the drag and drop container
            dragAndDropContainer.classList.add("hidden")
            // show the preview section
            previewContainer.classList.remove("hidden")
        }

        reader.readAsDataURL(files[0])
    }
    catch(error){
        // display the error
        operationError.innerHTML = `
        <p class="text-red-500 text-sm font-semibold mt-3"> ${error.message ? error.message : "something went wrong"} </p>
        `
        UploadButton.disabled = false
        stopTimer()
        console.log(error)
    }
    finally{
        // Enable the input fields
        FileInput.disabled = false
        FidelityRange.disabled = false
        FidelityValue.disabled = false
        upscaleRange.disabled = false
        upscaleValue.disabled = false
        tokenInput.disabled = false
        settingBtn.disabled = false
        dropZone.disabled = false

        UploadButton.classList.remove("mb-14")
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

        // hide the widget
        starContainer.classList.add('hidden')
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
            FidelityRange.value = data.fidelity
            FidelityValue.value = data.fidelity
            upscaleRange.value = data.upscale
            upscaleValue.value = data.upscale
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
            tokenInput.value = result.config.token || ""
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
    chrome.storage.local.set({ config: {
        enhance: enhance.value ,
        upsample: upsample.value,
        token: tokenInput.value
    }}, function() {
        console.log("configuration setting saved locally")
    });
    popupWindow.classList.add("hidden")
})

// close the preview section
closeRedBtn.addEventListener("click", () => {
    UploadButton.disabled = false
    previewContainer.classList.add("hidden")
    dragAndDropContainer.classList.remove("hidden")
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

// updating the fidelity value
FidelityRange.addEventListener("input", () => {
    FidelityValue.value =  FidelityRange.value
})

upscaleRange.addEventListener('input', () => {
    upscaleValue.value = upscaleRange.value
})

FidelityValue.addEventListener('input', () => {
    if(FidelityValue.value > 1 || FidelityValue.value < 0.1){
        FidelityRange.value = 0.5
    }
    else if(0.1 <= FidelityValue.value <= 1) {
        FidelityRange.value = FidelityValue.value
    }
    else {
        FidelityRange.value = 0.5
    }
})

upscaleValue.addEventListener('input', () => {
    if(upscaleValue.value > 4 || upscaleValue < 1){
        upscaleRange.value = 2
    }
    else if(1 <= upscaleValue.value <= 4) {
        upscaleRange.value = upscaleValue.value
    }
    else {
        upscaleRange.value = 2
    }
})