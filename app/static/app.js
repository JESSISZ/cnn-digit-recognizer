const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.getElementById("clearBtn");
const predictBtn = document.getElementById("predictBtn");
const predictedNumber = document.getElementById("predictedNumber");
const confidenceScore = document.getElementById("confidenceScore");
const probabilitiesList = document.getElementById("probabilitiesList");

let isDrawing = false;

function initCanvas() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function clearCanvas() {
    initCanvas();
    predictedNumber.textContent = "-";
    confidenceScore.textContent = "Confidence: --%";
    renderEmptyProbabilities();
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    ctx.closePath();
}

function renderEmptyProbabilities() {
    probabilitiesList.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        const row = document.createElement("div");
        row.className = "prob-row";
        row.innerHTML = `
            <span class="prob-label">${i}</span>
            <div class="prob-bar-container">
                <div class="prob-bar-fill" style="width: 0%"></div>
            </div>
            <span class="prob-val">0.0%</span>
        `;
        probabilitiesList.appendChild(row);
    }
}

function updateProbabilities(probs, bestDigit) {
    probabilitiesList.innerHTML = "";
    probs.forEach((prob, digit) => {
        const percent = (prob * 100).toFixed(1);
        const isBest = digit === bestDigit;
        const row = document.createElement("div");
        row.className = "prob-row";
        row.innerHTML = `
            <span class="prob-label">${digit}</span>
            <div class="prob-bar-container">
                <div class="prob-bar-fill ${isBest ? 'active' : ''}" style="width: ${percent}%"></div>
            </div>
            <span class="prob-val">${percent}%</span>
        `;
        probabilitiesList.appendChild(row);
    });
}

async function handlePredict() {
    predictBtn.disabled = true;
    predictBtn.textContent = "Processing...";

    try {
        const dataURL = canvas.toDataURL("image/png");
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_base64: dataURL })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        predictedNumber.textContent = data.number;
        confidenceScore.textContent = `Confidence: ${(data.confidence * 100).toFixed(1)}%`;

        if (data.probabilities) {
            updateProbabilities(data.probabilities, data.number);
        }
    } catch (err) {
        predictedNumber.textContent = "Err";
        confidenceScore.textContent = "Inference failed";
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = "Predict";
    }
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });

clearBtn.addEventListener("click", clearCanvas);
predictBtn.addEventListener("click", handlePredict);

initCanvas();
renderEmptyProbabilities();
