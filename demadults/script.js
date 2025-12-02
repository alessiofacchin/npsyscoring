function getES(val, ranges) {
 if (val >= ranges[0]) return 0;
 if (val >= ranges[1]) return 1;
 if (val >= ranges[2]) return 2;
 if (val >= ranges[3]) return 3;
 return 4;
}

document.getElementById("calcBtn").onclick = function () {
 let A = parseFloat(cardA.value);
 let B = parseFloat(cardB.value);
 let C = parseFloat(cardC.value);
 let eO = parseFloat(errO.value);
 let eA = parseFloat(errA.value);
 let eS = parseFloat(errS.value);
 let eT = parseFloat(errT.value);

 let VT = A + B;
 let AHT = C * (80 / (80 - eO + eA));
 let ratio = AHT / VT;
 let errTot = eO + eA + eS + eT;

 let table = document.querySelector("#resultsTable tbody");
 table.innerHTML = "";

 function addRow(name, raw, es) {
   let pct = es * 10;  // placeholder percentile
   table.innerHTML += `<tr><td>${name}</td><td>${raw.toFixed(2)}</td><td>${es}</td><td>${pct}</td></tr>`;
 }

 let esVT = getES(VT, [40.4, 34.2, 31.9, 29.9]);
 let esAHT = getES(AHT, [45.3, 37.7, 34.7, 32.0]);
 let esR = getES(ratio, [1.33, 1.18, 1.12, 1.08]);
 let esErr = getES(errTot, [2.2, 0.9, 0.2, 0.2]);

 addRow("VT", VT, esVT);
 addRow("AHT", AHT, esAHT);
 addRow("Ratio", ratio, esR);
 addRow("Errors", errTot, esErr);
};
