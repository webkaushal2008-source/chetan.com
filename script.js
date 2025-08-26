// Webkaushal Calculator Script 
// ------------------------------------------------------------------

// --------------- Global State -------------------------------------
let chart;
let strikePrices = [];
let ivDiffs = [];
let putIVs = [];
let callIVs = [];
let rowCount = 11;   // default rows (5 ITM, 1 ATM, 5 OTM)

// --------------- DOM Elements ------------------------------------
const optionRowsContainer = document.getElementById("optionRows");
const calculateBtn = document.getElementById("calculateBtn");
const graphBtn = document.getElementById("graphBtn");
const addRowBtn = document.getElementById("addRowBtn");
const symbolNameInput = document.getElementById("symbolNameInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const disclaimerBtn = document.getElementById("disclaimerBtn");
const body = document.body;

// --------------- Theme Management --------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || 
                    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggleBtn.innerHTML = `<i class='bx bx-sun'></i> Light Mode`;
  } else {
    body.classList.remove("dark-theme");
    themeToggleBtn.innerHTML = `<i class='bx bx-moon'></i> Dark Mode`;
  }
}

function toggleTheme() {
  body.classList.toggle("dark-theme");
  const isDark = body.classList.contains("dark-theme");
  
  if (isDark) {
    themeToggleBtn.innerHTML = `<i class='bx bx-sun'></i> Light Mode`;
    localStorage.setItem("theme", "dark");
  } else {
    themeToggleBtn.innerHTML = `<i class='bx bx-moon'></i> Dark Mode`;
    localStorage.setItem("theme", "light");
  }
  
  if (chart) {
    drawGraphOnly();
  }
}

// --------------- Disclaimer Page --------------------------------
function showDisclaimer() {
  const calculatorState = {
    inputs: getCurrentInputValues(),
    symbol: getSymbolName(),
    strikePrices: strikePrices,
    ivDiffs: ivDiffs,
    putIVs: putIVs,
    callIVs: callIVs,
    rowCount: rowCount,
    isDark: body.classList.contains("dark-theme")
  };
  localStorage.setItem('calculatorState', JSON.stringify(calculatorState));

  const isDark = calculatorState.isDark;
  
  document.body.innerHTML = `
    <div class="disclaimer-container">
      <h1>Disclaimer</h1>
      <div class="disclaimer-content">
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        <p>The information provided by Webkaushal Calculator ("we," "us," or "our") is for general informational purposes only. All information on this calculator is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.</p>
        <p><strong>Financial Disclaimer:</strong> The calculator is not intended to provide financial advice. We are not financial advisors, brokers, or dealers. The calculator's results should not be construed as financial advice or recommendations to buy, sell, or hold any security or investment. You should consult with a qualified financial professional before making any financial decisions.</p>
        <p><strong>No Warranty:</strong> Your use of the calculator is solely at your own risk. The calculator is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        <p><strong>Limitation of Liability:</strong> We will not be liable to you or any third party for any damages of any kind arising from the use of this calculator, including but not limited to direct, indirect, incidental, consequential, or punitive damages.</p>
        <p><strong>Accuracy of Calculations:</strong> While we strive to provide accurate calculations, we cannot guarantee that all calculations will be error-free. You should verify any critical calculations independently.</p>
      </div>
      <button id="backToCalculatorBtn" class="back-btn">
        <i class='bx bx-arrow-back'></i> Back to Calculator
      </button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Poppins', sans-serif;
      background: ${isDark ? '#121212' : '#ebebdc'};
      color: ${isDark ? '#ffffff' : '#333333'};
      padding: 20px;
      min-height: 100vh;
    }
    .disclaimer-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
      color: rgb(212, 16, 16);
    }
    .disclaimer-content {
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .disclaimer-content p {
      margin-bottom: 15px;
    }
    .back-btn {
      display: block;
      width: 100%;
      max-width: 200px;
      margin: 20px auto 0;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      background-color: purple;
      color: white;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .back-btn:hover {
      background-color: rgb(84, 2, 84);
    }
    .back-btn i {
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);

  document.getElementById('backToCalculatorBtn').addEventListener('click', () => {
    window.location.reload();
  });
}

// --------------- Helper Functions --------------------------------
function getSymbolName() {
  return symbolNameInput ? symbolNameInput.value.trim() : "";
}

function getCurrentInputValues() {
  const data = [];
  for (let i = 0; i < rowCount; i++) {
    data.push({
      strike: document.getElementById(`strike-${i}`)?.value || "",
      putIV: document.getElementById(`putiv-${i}`)?.value || "",
      callIV: document.getElementById(`calliv-${i}`)?.value || "",
      diffText: document.getElementById(`diff-${i}`)?.innerText || "-",
      diffClass: document.getElementById(`diff-${i}`)?.className || ""
    });
  }
  return data;
}

// --------------- Row Handling ------------------------------------
function createOptionRows(savedData = null) {
  optionRowsContainer.innerHTML = "";
  const atmIndex = Math.floor(rowCount / 2);

  for (let i = 0; i < rowCount; i++) {
    const strikePlaceholder =
      i < atmIndex ? "----- ITM -----" :
      i === atmIndex ? "----- ATM -----" : "----- OTM -----";

    const row = document.createElement("div");
    row.className = "option-row";

    const strikeVal = savedData ? savedData[i]?.strike : "";
    const putVal = savedData ? savedData[i]?.putIV : "";
    const callVal = savedData ? savedData[i]?.callIV : "";
    const diffText = savedData ? savedData[i]?.diffText : "-";
    const diffClass = savedData ? savedData[i]?.diffClass : "";

    row.innerHTML = `
      <input type="number" id="strike-${i}" placeholder="${strikePlaceholder}" value="${strikeVal}" />
      <input type="number" id="putiv-${i}" placeholder="Call Value %" value="${putVal}" />
      <input type="number" id="calliv-${i}" placeholder="Put Value %" value="${callVal}" />
      <span id="diff-${i}" class="${diffClass}">${diffText}</span>
    `;
    optionRowsContainer.appendChild(row);
  }
}

function addOptionRowsPair() {
  const currentData = getCurrentInputValues();
  const atmIndex = Math.floor(rowCount / 2);

  rowCount += 2;
  currentData.splice(atmIndex, 0, { strike: "", putIV: "", callIV: "", diffText: "-", diffClass: "" });
  currentData.splice(atmIndex + 2, 0, { strike: "", putIV: "", callIV: "", diffText: "-", diffClass: "" });

  createOptionRows(currentData);
}

// --------------- Calculation (UPDATED WITH TOTALS) ----------------
function calculateIV() {
  strikePrices = [];
  ivDiffs = [];
  putIVs = [];
  callIVs = [];
  let validData = false;

  let totalPositive = 0;
  let totalNegative = 0;

  for (let i = 0; i < rowCount; i++) {
    const strikeInput = document.getElementById(`strike-${i}`);
    const putInput = document.getElementById(`putiv-${i}`);
    const callInput = document.getElementById(`calliv-${i}`);
    const diffCell = document.getElementById(`diff-${i}`);

    const strike = parseFloat(strikeInput.value);
    const putIV = parseFloat(putInput.value);
    const callIV = parseFloat(callInput.value);

    if (!isNaN(strike) && !isNaN(callIV) && !isNaN(putIV)) {
      const diff = +((callIV - putIV) / 100).toFixed(2);

      strikePrices.push(strike);
      ivDiffs.push(diff);
      putIVs.push(putIV);
      callIVs.push(callIV);

      diffCell.innerText = diff.toFixed(2);
      diffCell.className = diff >= 0 ? "positive" : "negative";

      if (diff >= 0) totalPositive += diff;
      else totalNegative += diff;

      validData = true;
    } else {
      diffCell.innerText = "-";
      diffCell.className = "";
      putIVs.push(null);
      callIVs.push(null);
    }
  }

  graphBtn.disabled = !validData;
  showTotals(totalPositive, totalNegative); // ✅ Show totals
}

function showTotals(totalPositive, totalNegative) {
  let totalsDiv = document.getElementById("totals");
  if (!totalsDiv) {
    totalsDiv = document.createElement("div");
    totalsDiv.id = "totals";
    totalsDiv.style.marginTop = "10px";
    totalsDiv.style.fontWeight = "bold";
    totalsDiv.style.fontSize = "20px";
    totalsDiv.style.textAlign = "center";
    // ✅ Append totals div after Add Row button
    addRowBtn.parentElement.insertBefore(totalsDiv, addRowBtn.nextSibling);
  }
  totalsDiv.innerHTML = `
    Total Green (Positive): <span style="color:rgba(4, 155, 135, 1)">${totalPositive.toFixed(2)}</span> | 
    Total Red (Negative): <span style="color:rgb(212, 16, 16)">${totalNegative.toFixed(2)}</span>
  `;
}

// --------------- Chart Rendering ----------------------------------
function drawGraphOnly() {
  if (strikePrices.length === 0 || ivDiffs.length === 0) {
    alert("Please calculate values first!");
    return;
  }

  const ctx = document.getElementById("ivChart").getContext("2d");
  if (chart) chart.destroy();

  const symbolName = getSymbolName();
  const now = new Date();
  const dateStr = now.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  });

  const isDark = body.classList.contains("dark-theme");
  const textColor = isDark ? "#ffffff" : "#666";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: strikePrices,
      datasets: [
        {
          label: "Value Difference",
          data: ivDiffs,
          backgroundColor: ivDiffs.map(d => d >= 0 ? "#10b981" : "#ef4444"),
          borderRadius: 10,
          yAxisID: "y",
        },
        {
          label: "Trend Line",
          data: ivDiffs,
          type: "line",
          borderWidth: 2,
          pointBackgroundColor: ivDiffs.map(d => d >= 0 ? "#10b981" : "#ef4444"),
          fill: false,
          tension: 0.3,
          yAxisID: "y",
          segment: {
            borderColor: ctx => ctx.p0.parsed.y >= 0 ? "#10b981" : "#ef4444"
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          align: "start",
          text: [dateStr],
          font: { size: 14, weight: "normal" },
          color: textColor,
          padding: { top: 10, bottom: 30 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const writer = value >= 0 ? "Put Writer" : "Call Writer";
              return `Strike: ${context.label} | Diff: ${value} | ${writer}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: "Strike Price",
            color: textColor
          },
          ticks: { 
            autoSkip: false, 
            maxRotation: 90, 
            minRotation: 45,
            color: textColor
          },
          grid: { 
            color: gridColor,
            drawBorder: false
          }
        },
        y: {
          title: { 
            display: true, 
            text: "Value Difference (WebKaushal)",
            color: textColor
          },
          beginAtZero: false,
          ticks: {
            color: textColor
          },
          grid: { 
            color: gridColor,
            drawBorder: false
          },
        }
      }
    },
    plugins: [{
      id: "centerSymbolNameTitle",
      beforeDraw: (chart) => {
        if (!symbolName) return;
        const { ctx, width } = chart;
        const titleOpts = chart.options.plugins.title;
        const topPadding = titleOpts.padding?.top || 0;
        const titleFontSize = titleOpts.font.size || 14;
        const yPos = topPadding + titleFontSize + 10;

        ctx.save();
        ctx.font = "bold 20px Poppins, Arial";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(symbolName, width / 2, yPos);
        ctx.restore();
      }
    }]
  });

  document.getElementById("chartArea").scrollIntoView({ behavior: "smooth" });
}

// ------------------ Graph Download PDF ------------------
function downloadChart() {
  if (!chart) {
    alert("Please generate chart first!");
    return;
  }

  // Convert chart to image
  const imgData = chart.toBase64Image();

  // Create PDF object
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape"); // landscape for wide charts

  // Fit chart inside the PDF page
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth - 20;  // margin
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);

  // Save as PDF
  pdf.save("WebKaushal_Chart.pdf");
}

// ------------------ Show Graph ------------------
function showGraph() {
  calculateIV();
  drawGraphOnly();
  saveToHistory();
}

// --------------- History Management --------------------------------
function saveToHistory() {
  const data = {
    date: new Date().toISOString(),
    symbolName: getSymbolName(),
    strikePrices: [...strikePrices],
    ivDiffs: [...ivDiffs],
    putIVs: [...putIVs],
    callIVs: [...callIVs],
  };

  html2canvas(document.getElementById("chartArea"), { scale: 2 }).then(canvas => {
    data.img = canvas.toDataURL("image/png");
    const history = JSON.parse(localStorage.getItem("ivHistory") || "[]");
    history.unshift(data);
    if (history.length > 100) history.pop();
    localStorage.setItem("ivHistory", JSON.stringify(history));
  });
}

function showHistory() {
  const historyDiv = document.getElementById("historyList");
  const itemsDiv = document.getElementById("historyItems");
  itemsDiv.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("ivHistory") || "[]");

  if (history.length === 0) {
    itemsDiv.innerHTML = "<p>No history found.</p>";
  } else {
    history.forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleString();
      const symbolName = entry.symbolName || "";
      const div = document.createElement("div");
      div.className = "history-item";
      div.title = "Click to load this result";

      div.innerHTML = `
        <img src="${entry.img}" alt="Chart snapshot"/>
        <div>
          <div><strong>Date:</strong> ${date}</div>
          ${symbolName ? `<div><strong>Symbol:</strong> ${symbolName}</div>` : ""}
          <div><small>Strike Prices: ${entry.strikePrices.join(", ")}</small></div>
        </div>
        <button class="btn small-delete" onclick="deleteHistoryEntry(${index}, event)">
          <i class='bx bx-trash'></i>
        </button>
      `;

      div.querySelector("img").onclick = () => loadHistoryEntry(index);
      div.querySelector("div").onclick = () => loadHistoryEntry(index);
      itemsDiv.appendChild(div);
    });

    const deleteAllBtn = document.createElement("button");
    deleteAllBtn.className = "btn delete-btn";
    deleteAllBtn.innerHTML = `<i class='bx bx-trash'></i> Delete All History`;
    deleteAllBtn.onclick = clearHistory;
    itemsDiv.appendChild(deleteAllBtn);
  }

  historyDiv.style.display = "block";
  historyDiv.scrollIntoView({ behavior: "smooth" });
}

function deleteHistoryEntry(index, event) {
  event.stopPropagation();
  const history = JSON.parse(localStorage.getItem("ivHistory") || "[]");
  history.splice(index, 1);
  localStorage.setItem("ivHistory", JSON.stringify(history));
  showHistory();
}

function clearHistory() {
  if (confirm("Are you sure you want to delete all history?")) {
    localStorage.removeItem("ivHistory");
    showHistory();
  }
}

function loadHistoryEntry(index) {
  const history = JSON.parse(localStorage.getItem("ivHistory") || "[]");
  const entry = history[index];
  if (!entry) return;

  if (entry.strikePrices.length !== rowCount) {
    rowCount = entry.strikePrices.length;

    const savedData = [];
    for (let i = 0; i < rowCount; i++) {
      savedData.push({
        strike: entry.strikePrices[i] ?? "",
        putIV: entry.putIVs ? entry.putIVs[i] ?? "" : "",
        callIV: entry.callIVs ? entry.callIVs[i] ?? "" : "",
        diffText: (entry.ivDiffs[i] !== undefined) ? entry.ivDiffs[i].toFixed(2) : "-",
        diffClass: (entry.ivDiffs[i] >= 0) ? "positive" : "negative"
      });
    }
    createOptionRows(savedData);
  } else {
    for (let i = 0; i < rowCount; i++) {
      document.getElementById(`strike-${i}`).value = entry.strikePrices[i] ?? "";
      document.getElementById(`putiv-${i}`).value = entry.putIVs ? entry.putIVs[i] ?? "" : "";
      document.getElementById(`calliv-${i}`).value = entry.callIVs ? entry.callIVs[i] ?? "" : "";
      const diffCell = document.getElementById(`diff-${i}`);
      diffCell.innerText = (entry.ivDiffs[i] !== undefined) ? entry.ivDiffs[i].toFixed(2) : "-";
      diffCell.className = (entry.ivDiffs[i] >= 0) ? "positive" : "negative";
    }
  }

  if (symbolNameInput) symbolNameInput.value = entry.symbolName || "";

  strikePrices = [...entry.strikePrices];
  ivDiffs = [...entry.ivDiffs];
  putIVs = entry.putIVs ? [...entry.putIVs] : [];
  callIVs = entry.callIVs ? [...entry.callIVs] : [];

  drawGraphOnly();
}

function refreshPage() {
  window.location.reload();
}

// --------------- State Restoration -------------------------------
function restoreCalculatorState() {
  const savedState = localStorage.getItem('calculatorState');
  if (savedState) {
    const state = JSON.parse(savedState);
    
    rowCount = state.rowCount;
    strikePrices = state.strikePrices || [];
    ivDiffs = state.ivDiffs || [];
    putIVs = state.putIVs || [];
    callIVs = state.callIVs || [];
    
    if (symbolNameInput) symbolNameInput.value = state.symbol || "";
    
    createOptionRows(state.inputs);
    
    localStorage.removeItem('calculatorState');
    
    if (strikePrices.length > 0) {
      drawGraphOnly();
    }
  }
}

// --------------- Event Listeners ---------------------------------
calculateBtn.addEventListener("click", calculateIV);
addRowBtn.addEventListener("click", addOptionRowsPair);
graphBtn.addEventListener("click", showGraph);
themeToggleBtn.addEventListener("click", toggleTheme);
disclaimerBtn.addEventListener("click", showDisclaimer);

// --------------- Initialize App ----------------------------------
initTheme();
createOptionRows();
restoreCalculatorState();

document.addEventListener
("contextmenu",function(e)
{
  e.preventDefault()
},false)
