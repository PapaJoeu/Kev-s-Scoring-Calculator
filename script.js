const GUTTER_SIZE = 0.125;

function calculateAndRender() {
  const pageLength = parseFloat(document.getElementById("page-length").value.trim());
  const docLength = parseFloat(document.getElementById("doc-length").value.trim());
  const scoreType = document.getElementById("score-type").value;
  const customScoresInput = document.getElementById("custom-scores").value.trim();

  if (isNaN(pageLength) || pageLength <= 0 || isNaN(docLength) || docLength <= 0) {
    alert("Please enter valid positive numbers for page length and document length.");
    return;
  }

  const maxDocs = calculateMaxDocuments(pageLength, docLength, GUTTER_SIZE);
  const docStarts = calculateDocumentStartPositions(pageLength, docLength, GUTTER_SIZE, maxDocs);

  let scorePositions = [];
  if (scoreType === "bifold") {
    scorePositions = calculateBifoldScores(docStarts, docLength);
  } else if (scoreType === "trifold") {
    scorePositions = calculateTrifoldScores(docStarts, docLength);
  } else if (scoreType === "gatefold") {
    scorePositions = calculateGatefoldScores(docStarts, docLength);
  } else if (scoreType === "custom") {
    scorePositions = calculateCustomDocScores(docStarts, docLength, customScoresInput);
  }

  displayCalculationResults(maxDocs, docStarts, scorePositions);
  renderVisualization(pageLength, docStarts, docLength, scorePositions);
}

function calculateMaxDocuments(pageLength, docLength, gutterSize) {
  return Math.floor((pageLength + gutterSize) / (docLength + gutterSize));
}

function calculateDocumentStartPositions(pageLength, docLength, gutterSize, maxDocs) {
  const totalOccupied = (maxDocs * docLength) + ((maxDocs - 1) * gutterSize);
  const remainingSpace = pageLength - totalOccupied;
  const startOffset = remainingSpace / 2;

  const starts = [];
  for (let i = 0; i < maxDocs; i++) {
    starts.push(Math.round((startOffset + i * (docLength + gutterSize)) * 1000) / 1000);
  }
  return starts;
}

function calculateBifoldScores(docStarts, docLength) {
  return docStarts.map(start => Math.round((start + (docLength / 2)) * 1000) / 1000);
}

function calculateTrifoldScores(docStarts, docLength) {
  const scores = [];
  docStarts.forEach(start => {
    scores.push(Math.round((start + (docLength / 3)) * 1000) / 1000);
    scores.push(Math.round((start + (2 * docLength / 3)) * 1000) / 1000);
  });
  return scores;
}

function calculateGatefoldScores(docStarts, docLength) {
  const scores = [];
  docStarts.forEach(start => {
    scores.push(Math.round((start + (docLength / 4)) * 1000) / 1000);
    scores.push(Math.round((start + (3 * docLength / 4)) * 1000) / 1000);
  });
  return scores;
}

function calculateCustomDocScores(docStarts, docLength, input) {
  if (!input) return [];
  const offsets = input.split(",").map(x => parseFloat(x.trim()));
  const validOffsets = offsets.filter(offset => !isNaN(offset) && offset >= 0 && offset <= docLength);

  const positions = [];
  docStarts.forEach(start => {
    validOffsets.forEach(offset => {
      positions.push(Math.round((start + offset) * 1000) / 1000);
    });
  });

  return positions.sort((a, b) => a - b);
}

function displayCalculationResults(maxDocs, docStarts, scorePositions) {
  const out = document.getElementById("results");
  out.innerHTML = `
    <strong>Max Documents:</strong> ${maxDocs}<br>
    <strong>Document Start Positions:</strong> ${docStarts.join(", ")}<br>
    <strong>Score Positions:</strong> ${scorePositions.join(", ")}
  `;
}

function renderVisualization(pageLength, docStarts, docLength, scorePositions) {
  const canvas = document.getElementById("visualizer");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const scale = W / pageLength;
  if (!isFinite(scale) || scale <= 0) {
    alert("Page length too large or invalid for visualization.");
    return;
  }

  ctx.save();

  ctx.strokeStyle = "black";
  ctx.strokeRect(0, H / 4, W, H / 2);

  ctx.fillStyle = "#87cefa";
  docStarts.forEach(start => {
    const x = start * scale;
    const w = docLength * scale;
    ctx.fillRect(x, H / 4, w, H / 2);
  });

  ctx.strokeStyle = "red";
  scorePositions.forEach(pos => {
    const x = pos * scale;
    ctx.beginPath();
    ctx.moveTo(x, H / 4);
    ctx.lineTo(x, 3 * H / 4);
    ctx.stroke();
  });

  ctx.restore();
}

function quickSelectPageLength(value) {
  document.getElementById("page-length").value = value;
}

function quickSelectDocLength(value) {
  document.getElementById("doc-length").value = value;
}

function selectScoreType(value) {
  document.getElementById("score-type").value = value;
  const customContainer = document.getElementById("custom-scores-container");
  if (value === "custom") {
    customContainer.style.display = "block";
    document.getElementById("custom-scores").focus();
  } else {
    customContainer.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const gutterDisplay = document.getElementById("gutter-display");
  if (gutterDisplay) {
    gutterDisplay.value = GUTTER_SIZE;
  }
});
