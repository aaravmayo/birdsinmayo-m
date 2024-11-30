// The link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/aVQhAZXAU/";

let model, webcam, labelContainer, maxPredictions;
let currentDeviceId = null;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam (initialize with the default device)
    webcam = new tmImage.Webcam(200, 200, true); // width, height, flip
    await setupWebcam();
}

async function setupWebcam() {
    // Get the list of video devices and choose the appropriate one
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // If no camera is available, show an alert
    if (videoDevices.length === 0) {
        alert('No camera detected.');
        return;
    }

    if (currentDeviceId === null) {
        currentDeviceId = videoDevices[0].deviceId; // Default to the first camera
    }

    // Set up the webcam with the current device ID
    await webcam.setup({ videoDeviceId: currentDeviceId });
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // Add class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // Update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// Switch between front and rear cameras
async function switchCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    if (videoDevices.length < 2) {
        alert("Only one camera available.");
        return;
    }

    // Switch to the other camera
    currentDeviceId = currentDeviceId === videoDevices[0].deviceId ? videoDevices[1].deviceId : videoDevices[0].deviceId;
    webcam.stop(); // Stop the current webcam stream
    await setupWebcam(); // Set up the new webcam stream
}
