// Database dei valori normativi estratti dalle tabelle
const norms = {
  6: [
    { pct: 99, vt: 41, aht: 52, ratio: 1.13, err: 0 }, { pct: 95, vt: 44, aht: 64, ratio: 1.16, err: 0 },
    { pct: 90, vt: 50, aht: 74, ratio: 1.22, err: 3 }, { pct: 85, vt: 53, aht: 77, ratio: 1.24, err: 5 },
    { pct: 80, vt: 55, aht: 80, ratio: 1.26, err: 7 }, { pct: 75, vt: 57, aht: 89, ratio: 1.32, err: 9 },
    { pct: 70, vt: 59, aht: 92, ratio: 1.36, err: 9 }, { pct: 65, vt: 61, aht: 94, ratio: 1.38, err: 11 },
    { pct: 60, vt: 64, aht: 98, ratio: 1.42, err: 13 }, { pct: 55, vt: 66, aht: 100, ratio: 1.44, err: 14 },
    { pct: 50, vt: 69, aht: 102, ratio: 1.47, err: 15 }, { pct: 45, vt: 71, aht: 105, ratio: 1.51, err: 16 },
    { pct: 40, vt: 72, aht: 108, ratio: 1.53, err: 19 }, { pct: 35, vt: 73, aht: 113, ratio: 1.58, err: 20 },
    { pct: 30, vt: 78, aht: 121, ratio: 1.63, err: 20 }, { pct: 25, vt: 83, aht: 125, ratio: 1.69, err: 21 },
    { pct: 20, vt: 89, aht: 132, ratio: 1.72, err: 23 }, { pct: 15, vt: 96, aht: 138, ratio: 1.79, err: 24 },
    { pct: 10, vt: 102, aht: 153, ratio: 1.92, err: 26 }, { pct: 5,  vt: 119, aht: 179, ratio: 2.12, err: 27 },
    { pct: 1,  vt: 135, aht: 192, ratio: 2.59, err: 33 }
  ],
  7: [
    { pct: 99, vt: 34, aht: 41, ratio: 0.99, err: 0 }, { pct: 95, vt: 39, aht: 52, ratio: 1.07, err: 0 },
    { pct: 90, vt: 42, aht: 53, ratio: 1.15, err: 0 }, { pct: 85, vt: 44, aht: 56, ratio: 1.19, err: 0 },
    { pct: 80, vt: 45, aht: 59, ratio: 1.22, err: 1 }, { pct: 75, vt: 46, aht: 61, ratio: 1.24, err: 1 },
    { pct: 70, vt: 47, aht: 64, ratio: 1.28, err: 2 }, { pct: 65, vt: 48, aht: 66, ratio: 1.30, err: 4 },
    { pct: 60, vt: 48, aht: 67, ratio: 1.32, err: 5 }, { pct: 55, vt: 49, aht: 70, ratio: 1.36, err: 5 },
    { pct: 50, vt: 51, aht: 71, ratio: 1.38, err: 6 }, { pct: 45, vt: 52, aht: 74, ratio: 1.42, err: 7 },
    { pct: 40, vt: 53, aht: 75, ratio: 1.44, err: 10 }, { pct: 35, vt: 54, aht: 79, ratio: 1.50, err: 10 },
    { pct: 30, vt: 57, aht: 81, ratio: 1.53, err: 11 }, { pct: 25, vt: 59, aht: 83, ratio: 1.56, err: 11 },
    { pct: 20, vt: 60, aht: 90, ratio: 1.61, err: 13 }, { pct: 15, vt: 62, aht: 94, ratio: 1.67, err: 15 },
    { pct: 10, vt: 66, aht: 101, ratio: 1.76, err: 17 }, { pct: 5,  vt: 74, aht: 113, ratio: 1.92, err: 23 },
    { pct: 1,  vt: 84, aht: 150, ratio: 2.15, err: 34 }
  ],
  8: [
    { pct: 99, vt: 31, aht: 35, ratio: 0.95, err: 0 }, { pct: 95, vt: 34, aht: 42, ratio: 1.03, err: 0 },
    { pct: 90, vt: 36, aht: 45, ratio: 1.07, err: 0 }, { pct: 85, vt: 38, aht: 47, ratio: 1.11, err: 0 },
    { pct: 80, vt: 39, aht: 48, ratio: 1.14, err: 0 }, { pct: 75, vt: 40, aht: 50, ratio: 1.17, err: 0 },
    { pct: 70, vt: 41, aht: 51, ratio: 1.20, err: 1 }, { pct: 65, vt: 42, aht: 53, ratio: 1.22, err: 1 },
    { pct: 60, vt: 43, aht: 55, ratio: 1.25, err: 1 }, { pct: 55, vt: 43, aht: 56, ratio: 1.27, err: 2 },
    { pct: 50, vt: 44, aht: 58, ratio: 1.29, err: 2 }, { pct: 45, vt: 45, aht: 59, ratio: 1.31, err: 3 },
    { pct: 40, vt: 47, aht: 60, ratio: 1.32, err: 4 }, { pct: 35, vt: 48, aht: 63, ratio: 1.35, err: 5 },
    { pct: 30, vt: 49, aht: 65, ratio: 1.39, err: 5 }, { pct: 25, vt: 51, aht: 67, ratio: 1.43, err: 6 },
    { pct: 20, vt: 52, aht: 70, ratio: 1.46, err: 8 }, { pct: 15, vt: 54, aht: 74, ratio: 1.51, err: 10 },
    { pct: 10, vt: 55, aht: 78, ratio: 1.59, err: 11 }, { pct: 5,  vt: 58, aht: 85, ratio: 1.68, err: 13 },
    { pct: 1,  vt: 78, aht: 114, ratio: 1.95, err: 21 }
  ],
  9: [
    { pct: 99, vt: 27, aht: 31, ratio: 0.94, err: 0 }, { pct: 95, vt: 29, aht: 34, ratio: 1.01, err: 0 },
    { pct: 90, vt: 33, aht: 38, ratio: 1.07, err: 0 }, { pct: 85, vt: 34, aht: 41, ratio: 1.10, err: 0 },
    { pct: 80, vt: 36, aht: 43, ratio: 1.12, err: 0 }, { pct: 75, vt: 37, aht: 44, ratio: 1.13, err: 0 },
    { pct: 70, vt: 38, aht: 44, ratio: 1.15, err: 0 }, { pct: 65, vt: 39, aht: 46, ratio: 1.17, err: 0 },
    { pct: 60, vt: 40, aht: 47, ratio: 1.18, err: 0 }, { pct: 55, vt: 41, aht: 49, ratio: 1.19, err: 1 },
    { pct: 50, vt: 41, aht: 51, ratio: 1.20, err: 1 }, { pct: 45, vt: 42, aht: 52, ratio: 1.23, err: 1 },
    { pct: 40, vt: 43, aht: 53, ratio: 1.25, err: 2 }, { pct: 35, vt: 44, aht: 54, ratio: 1.27, err: 2 },
    { pct: 30, vt: 45, aht: 55, ratio: 1.30, err: 3 }, { pct: 25, vt: 46, aht: 57, ratio: 1.31, err: 4 },
    { pct: 20, vt: 48, aht: 62, ratio: 1.34, err: 5 }, { pct: 15, vt: 50, aht: 65, ratio: 1.38, err: 7 },
    { pct: 10, vt: 53, aht: 69, ratio: 1.43, err: 7 }, { pct: 5,  vt: 57, aht: 73, ratio: 1.52, err: 10 },
    { pct: 1,  vt: 68, aht: 99, ratio: 1.87, err: 20 }
  ],
  10: [
    { pct: 99, vt: 28, aht: 29, ratio: 0.97, err: 0 }, { pct: 95, vt: 30, aht: 33, ratio: 1.01, err: 0 },
    { pct: 90, vt: 31, aht: 35, ratio: 1.04, err: 0 }, { pct: 85, vt: 32, aht: 37, ratio: 1.05, err: 0 },
    { pct: 80, vt: 33, aht: 38, ratio: 1.07, err: 0 }, { pct: 75, vt: 34, aht: 39, ratio: 1.08, err: 0 },
    { pct: 70, vt: 34, aht: 40, ratio: 1.10, err: 0 }, { pct: 65, vt: 35, aht: 41, ratio: 1.11, err: 0 },
    { pct: 60, vt: 36, aht: 42, ratio: 1.13, err: 0 }, { pct: 55, vt: 36, aht: 43, ratio: 1.14, err: 1 },
    { pct: 50, vt: 37, aht: 44, ratio: 1.16, err: 1 }, { pct: 45, vt: 38, aht: 44, ratio: 1.17, err: 1 },
    { pct: 40, vt: 38, aht: 45, ratio: 1.19, err: 2 }, { pct: 35, vt: 39, aht: 46, ratio: 1.20, err: 2 },
    { pct: 30, vt: 41, aht: 48, ratio: 1.22, err: 3 }, { pct: 25, vt: 41, aht: 50, ratio: 1.26, err: 3 },
    { pct: 20, vt: 43, aht: 52, ratio: 1.27, err: 4 }, { pct: 15, vt: 45, aht: 54, ratio: 1.31, err: 5 },
    { pct: 10, vt: 47, aht: 57, ratio: 1.35, err: 6 }, { pct: 5,  vt: 49, aht: 59, ratio: 1.41, err: 8 },
    { pct: 1,  vt: 61, aht: 67, ratio: 1.65, err: 11 }
  ],
  11: [
    { pct: 99, vt: 23, aht: 23, ratio: 0.94, err: 0 }, { pct: 95, vt: 25, aht: 27, ratio: 0.98, err: 0 },
    { pct: 90, vt: 28, aht: 29, ratio: 1.00, err: 0 }, { pct: 85, vt: 29, aht: 30, ratio: 1.01, err: 0 },
    { pct: 80, vt: 30, aht: 32, ratio: 1.03, err: 0 }, { pct: 75, vt: 30, aht: 35, ratio: 1.06, err: 0 },
    { pct: 70, vt: 32, aht: 36, ratio: 1.07, err: 0 }, { pct: 65, vt: 33, aht: 37, ratio: 1.08, err: 0 },
    { pct: 60, vt: 33, aht: 37, ratio: 1.09, err: 1 }, { pct: 55, vt: 34, aht: 38, ratio: 1.10, err: 1 },
    { pct: 50, vt: 34, aht: 38, ratio: 1.11, err: 1 }, { pct: 45, vt: 35, aht: 39, ratio: 1.12, err: 1 },
    { pct: 40, vt: 35, aht: 40, ratio: 1.13, err: 2 }, { pct: 35, vt: 36, aht: 42, ratio: 1.14, err: 2 },
    { pct: 30, vt: 38, aht: 42, ratio: 1.16, err: 2 }, { pct: 25, vt: 38, aht: 44, ratio: 1.18, err: 3 },
    { pct: 20, vt: 40, aht: 45, ratio: 1.22, err: 3 }, { pct: 15, vt: 41, aht: 47, ratio: 1.23, err: 4 },
    { pct: 10, vt: 43, aht: 49, ratio: 1.27, err: 5 }, { pct: 5,  vt: 47, aht: 56, ratio: 1.31, err: 5 },
    { pct: 1,  vt: 52, aht: 64, ratio: 1.49, err: 8 }
  ],
  12: [
    { pct: 99, vt: 22, aht: 24, ratio: 0.93, err: 0 }, { pct: 95, vt: 24, aht: 26, ratio: 0.96, err: 0 },
    { pct: 90, vt: 25, aht: 27, ratio: 1.01, err: 0 }, { pct: 85, vt: 26, aht: 29, ratio: 1.03, err: 0 },
    { pct: 80, vt: 27, aht: 30, ratio: 1.04, err: 0 }, { pct: 75, vt: 28, aht: 31, ratio: 1.06, err: 0 },
    { pct: 70, vt: 28, aht: 32, ratio: 1.08, err: 0 }, { pct: 65, vt: 29, aht: 33, ratio: 1.09, err: 0 },
    { pct: 60, vt: 29, aht: 33, ratio: 1.10, err: 0 }, { pct: 55, vt: 30, aht: 34, ratio: 1.10, err: 0 },
    { pct: 50, vt: 30, aht: 35, ratio: 1.12, err: 0 }, { pct: 45, vt: 32, aht: 35, ratio: 1.13, err: 1 },
    { pct: 40, vt: 32, aht: 36, ratio: 1.14, err: 1 }, { pct: 35, vt: 33, aht: 36, ratio: 1.15, err: 1 },
    { pct: 30, vt: 34, aht: 37, ratio: 1.17, err: 1 }, { pct: 25, vt: 34, aht: 38, ratio: 1.18, err: 2 },
    { pct: 20, vt: 36, aht: 40, ratio: 1.19, err: 2 }, { pct: 15, vt: 38, aht: 41, ratio: 1.21, err: 2 },
    { pct: 10, vt: 39, aht: 45, ratio: 1.24, err: 3 }, { pct: 5,  vt: 43, aht: 48, ratio: 1.31, err: 5 },
    { pct: 1,  vt: 48, aht: 53, ratio: 1.38, err: 8 }
  ],
  13: [
    { pct: 99, vt: 19, aht: 19, ratio: 0.93, err: 0 }, { pct: 95, vt: 23, aht: 24, ratio: 0.97, err: 0 },
    { pct: 90, vt: 25, aht: 27, ratio: 0.99, err: 0 }, { pct: 85, vt: 26, aht: 27, ratio: 1.01, err: 0 },
    { pct: 80, vt: 26, aht: 28, ratio: 1.03, err: 0 }, { pct: 75, vt: 27, aht: 28, ratio: 1.03, err: 0 },
    { pct: 70, vt: 27, aht: 29, ratio: 1.04, err: 0 }, { pct: 65, vt: 28, aht: 31, ratio: 1.05, err: 0 },
    { pct: 60, vt: 28, aht: 32, ratio: 1.06, err: 0 }, { pct: 55, vt: 29, aht: 32, ratio: 1.07, err: 0 },
    { pct: 50, vt: 29, aht: 33, ratio: 1.09, err: 0 }, { pct: 45, vt: 30, aht: 33, ratio: 1.11, err: 1 },
    { pct: 40, vt: 30, aht: 33, ratio: 1.13, err: 1 }, { pct: 35, vt: 31, aht: 34, ratio: 1.14, err: 1 },
    { pct: 30, vt: 31, aht: 35, ratio: 1.15, err: 1 }, { pct: 25, vt: 32, aht: 36, ratio: 1.16, err: 2 },
    { pct: 20, vt: 33, aht: 37, ratio: 1.21, err: 2 }, { pct: 15, vt: 34, aht: 41, ratio: 1.23, err: 2 },
    { pct: 10, vt: 36, aht: 42, ratio: 1.27, err: 4 }, { pct: 5,  vt: 39, aht: 45, ratio: 1.39, err: 6 },
    { pct: 1,  vt: 42, aht: 54, ratio: 1.49, err: 8 }
  ],
  14: [
    { pct: 99, vt: 21, aht: 22, ratio: 0.95, err: 0 }, { pct: 95, vt: 23, aht: 25, ratio: 0.97, err: 0 },
    { pct: 90, vt: 24, aht: 27, ratio: 1.00, err: 0 }, { pct: 85, vt: 25, aht: 28, ratio: 1.03, err: 0 },
    { pct: 80, vt: 26, aht: 28, ratio: 1.04, err: 0 }, { pct: 75, vt: 26, aht: 30, ratio: 1.06, err: 0 },
    { pct: 70, vt: 26, aht: 30, ratio: 1.08, err: 0 }, { pct: 65, vt: 27, aht: 31, ratio: 1.10, err: 0 },
    { pct: 60, vt: 27, aht: 31, ratio: 1.12, err: 0 }, { pct: 55, vt: 27, aht: 31, ratio: 1.13, err: 0 },
    { pct: 50, vt: 28, aht: 32, ratio: 1.13, err: 0 }, { pct: 45, vt: 29, aht: 32, ratio: 1.13, err: 0 },
    { pct: 40, vt: 30, aht: 32, ratio: 1.14, err: 1 }, { pct: 35, vt: 30, aht: 33, ratio: 1.17, err: 1 },
    { pct: 30, vt: 31, aht: 34, ratio: 1.17, err: 1 }, { pct: 25, vt: 31, aht: 35, ratio: 1.17, err: 1 },
    { pct: 20, vt: 32, aht: 35, ratio: 1.18, err: 1 }, { pct: 15, vt: 33, aht: 36, ratio: 1.19, err: 2 },
    { pct: 10, vt: 34, aht: 38, ratio: 1.20, err: 2 }, { pct: 5,  vt: 37, aht: 44, ratio: 1.23, err: 2 },
    { pct: 1,  vt: 44, aht: 49, ratio: 1.23, err: 3 }
  ]
};

// Funzione per cercare il percentile che ha la distanza minore dal valore calcolato
function findClosestPercentile(age, key, targetValue) {
  let ageData = norms[age];
  if (!ageData) return "-";
  
  let closestPct = ageData[0].pct;
  let minDiff = Math.abs(ageData[0][key] - targetValue);

  // Scorre dal 99 al 1 percentile, se c'è un match ugualmente vicino
  // manterrà il percentile più alto incontrato per primo
  for (let i = 1; i < ageData.length; i++) {
    let diff = Math.abs(ageData[i][key] - targetValue);
    if (diff < minDiff) {
      minDiff = diff;
      closestPct = ageData[i].pct;
    }
  }
  return closestPct;
}

document.getElementById("calcBtn").onclick = function () {
  let age = parseInt(document.getElementById("age").value);
  if (isNaN(age) || age < 6 || age > 14) {
    alert("Per favore, inserisci un'età valida compresa tra 6 e 14 anni.");
    return;
  }

  // Estrazione input (fallback a 0 se campo vuoto)
  let A = parseFloat(document.getElementById("cardA").value) || 0;
  let B = parseFloat(document.getElementById("cardB").value) || 0;
  let C = parseFloat(document.getElementById("cardC").value) || 0;
  
  let eO = parseFloat(document.getElementById("errO").value) || 0;
  let eA = parseFloat(document.getElementById("errA").value) || 0;
  let eS = parseFloat(document.getElementById("errS").value) || 0;
  let eT = parseFloat(document.getElementById("errT").value) || 0;

  // Calcoli Formule DEM
  let VT = A + B;
  let denom = 80 - eO + eA;
  let AHT = denom === 0 ? 0 : C * (80 / denom);
  let ratio = VT === 0 ? 0 : AHT / VT;
  let errTot = eO + eA + eS + eT;

  // Render dei risultati
  let table = document.querySelector("#resultsTable tbody");
  table.innerHTML = "";

  function addRow(name, raw, pct) {
    table.innerHTML += `<tr><td>${name}</td><td>${raw.toFixed(2)}</td><td>${pct}</td></tr>`;
  }

  // Identifica i percentili più vicini
  let pctVT = findClosestPercentile(age, 'vt', VT);
  let pctAHT = findClosestPercentile(age, 'aht', AHT);
  let pctRatio = findClosestPercentile(age, 'ratio', ratio);
  let pctErr = findClosestPercentile(age, 'err', errTot);

  addRow("VT", VT, pctVT);
  addRow("AHT", AHT, pctAHT);
  addRow("Ratio", ratio, pctRatio);
  addRow("Errori", errTot, pctErr);
};