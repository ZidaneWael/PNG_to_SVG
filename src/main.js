import ImageTracer from 'imagetracerjs';

const fileInput = document.getElementById('file');
const convertBtn = document.getElementById('convert');
const downloadLink = document.getElementById('download');
const result = document.getElementById('result');
const canvas = document.getElementById('canvas');
const status = document.getElementById('status');

let engineReady = true;
let lastSvgUrl = null;
const traceOptions = {
  pathomit: 8,
  ltres: 1,
  qtres: 1,
  numberofcolors: 16,
  colorquantcycles: 3,
  colorsampling: 2,
  layering: 0,
  roundcoords: 1,
  scale: 1,
  strokewidth: 1,
  viewbox: true,
  desc: false,
  blurradius: 0,
  blurdelta: 20
};

function loadImageToCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

fileInput.addEventListener('change', async (e) => {
  result.innerHTML = '';
  downloadLink.style.display = 'none';
  if (!e.target.files || e.target.files.length === 0) {
    convertBtn.disabled = true;
    return;
  }
  if (!engineReady) {
    status.textContent = 'Engine not ready yet. Please wait.';
    convertBtn.disabled = true;
    return;
  }
  const file = e.target.files[0];
  await loadImageToCanvas(file);
  convertBtn.disabled = false;
});

convertBtn.addEventListener('click', async () => {
  if (!engineReady) {
    result.textContent = 'Engine not ready yet. Try again in a moment.';
    return;
  }
  convertBtn.disabled = true;
  result.textContent = 'Converting...';
  status.textContent = 'Converting image...';

  try {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const svg = ImageTracer.imagedataToSVG(imageData, traceOptions);

    if (lastSvgUrl) URL.revokeObjectURL(lastSvgUrl);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    lastSvgUrl = URL.createObjectURL(blob);

    result.innerHTML = `<div class="svg-link"><a href="${lastSvgUrl}" target="_blank">Open SVG in new tab</a></div>`;
    downloadLink.href = lastSvgUrl;
    downloadLink.download = 'image.svg';
    downloadLink.style.display = 'inline-block';
    status.textContent = 'Conversion complete.';
  } catch (err) {
    console.error(err);
    result.textContent = 'Conversion failed. See console for details.';
    status.textContent = 'Conversion failed.';
  } finally {
    convertBtn.disabled = false;
  }
});

status.textContent = 'Engine ready.';
fileInput.disabled = false;
