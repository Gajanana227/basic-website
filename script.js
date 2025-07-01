const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const webcam = document.getElementById("webcam");
const snapshotsDiv = document.getElementById("snapshots");

let stream;
let captureInterval;
let snapshots = [];
let zip = new JSZip();

startBtn.addEventListener("click", async () => {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  webcam.srcObject = stream;

  startBtn.disabled = true;
  stopBtn.disabled = false;
  snapshots = [];
  zip = new JSZip();
  snapshotsDiv.innerHTML = "";

  captureSnapshots();
});

stopBtn.addEventListener("click", () => {
  clearInterval(captureInterval);
  stream.getTracks().forEach((track) => track.stop());
  webcam.srcObject = null;

  startBtn.disabled = false;
  stopBtn.disabled = true;

  downloadSnapshots();
});

function captureSnapshots() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 300;

  // At least 4 snapshots every 10 seconds, so roughly every 2.5 seconds, random offset
  captureInterval = setInterval(() => {
    const randomDelay = Math.random() * 2000;

    setTimeout(() => {
      ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `snapshot-${timestamp}.png`;

        snapshots.push({ filename, blob });

        const img = document.createElement("img");
        img.src = URL.createObjectURL(blob);
        snapshotsDiv.appendChild(img);
      }, "image/png");
    }, randomDelay);
  }, 2500);
}

function downloadSnapshots() {
  if (snapshots.length === 0) {
    alert("No snapshots to save!");
    return;
  }

  snapshots.forEach(({ filename, blob }) => {
    zip.file(filename, blob);
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `Snapshots_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.zip`;
    a.click();
  });
}
