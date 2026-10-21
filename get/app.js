/*
 * Glare Effect Test calculator. Dependency-free, browser-only JavaScript.
 * Sources and explicit implementation choices are documented in index.html.
 * Model: logit[P(full glare)] = beta0 + beta1 * actual card value.
 * No penalty, artificial reference observations, guessing floor or PSE clamp.
 * GETStats is also exported for independent numerical verification in Node.
 */
(function (root) {
  "use strict";

  class AnalysisError extends Error {
    constructor(message, field = "response-cards") {
      super(message);
      this.name = "AnalysisError";
      this.field = field;
    }
  }

  function parseCardList(raw, name = "Card list", allowEmpty = false) {
    if (!raw.trim()) {
      if (allowEmpty) return [];
      throw new AnalysisError(`${name} is empty. Enter card numbers separated by commas.`);
    }
    const tokens = raw.trim().split(",");
    const values = tokens.map((token, i) => {
      if (!/^\d+$/.test(token.trim())) {
        throw new AnalysisError(`${name}: entry ${i + 1} must be a whole card number. Use commas between entries; remove empty entries and trailing commas.`);
      }
      const value = Number(token.trim());
      if (!Number.isSafeInteger(value)) throw new AnalysisError(`${name}: entry ${i + 1} is not a valid card number.`);
      return value;
    });
    const seen = new Set();
    for (const value of values) {
      if (seen.has(value)) throw new AnalysisError(`${name}: card ${value} appears more than once. Enter each card only once.`);
      seen.add(value);
    }
    return values;
  }

  function makeData(count, mode, customText, responseText, responseType) {
    if (!Number.isInteger(count) || count < 3 || count > 100) {
      throw new AnalysisError("Enter an integer from 3 to 100 for the number of intermediate cards.", "card-count");
    }
    if (!["consecutive", "custom"].includes(mode)) throw new AnalysisError("Choose a valid card numbering mode.", "deck-mode");
    if (!["glare", "no-glare"].includes(responseType)) throw new AnalysisError("Choose a response category.");
    let x;
    if (mode === "custom") {
      try { x = parseCardList(customText, "Presented cards"); }
      catch (error) { error.field = "administered-cards"; throw error; }
      if (x.length !== count) throw new AnalysisError(`The presented-card list has ${x.length} cards; the specified number is ${count}. These must match.`, "administered-cards");
      if (x.some(value => value < 1 || value > 100)) throw new AnalysisError("Presented card values must be integers from 1 to 100. Reference cards 0 and 101 must be excluded.", "administered-cards");
      x.sort((a, b) => a - b);
    } else {
      x = Array.from({ length: count }, (_, i) => i + 1);
    }
    const entered = parseCardList(responseText, "Classified cards");
    const deck = new Set(x);
    const invalid = entered.filter(value => !deck.has(value));
    if (invalid.length) throw new AnalysisError(`Card${invalid.length > 1 ? "s" : ""} ${invalid.slice(0, 8).join(", ")}${invalid.length > 8 ? ", …" : ""} ${invalid.length > 1 ? "are" : "is"} not in the presented deck. Check the card count and numbering; exclude reference cards 0 and 101.`);
    const selected = new Set(entered);
    const y = x.map(value => Number(responseType === "glare" ? selected.has(value) : !selected.has(value)));
    return { x, y, entered: entered.sort((a, b) => a - b), count, mode, responseType };
  }

  // Stable logistic probabilities and log likelihood, including extreme tails.
  function sigmoid(eta) {
    if (eta >= 0) return 1 / (1 + Math.exp(-eta));
    const e = Math.exp(eta);
    return e / (1 + e);
  }
  function softplus(value) { return Math.max(value, 0) + Math.log1p(Math.exp(-Math.abs(value))); }
  function logLikelihood(z, y, a, b) {
    let ll = 0;
    for (let i = 0; i < z.length; i++) {
      const eta = a + b * z[i];
      ll -= y[i] ? softplus(-eta) : softplus(eta);
    }
    return ll;
  }

  function fitLogistic(x, y) {
    if (x.length !== y.length || x.length < 3 || x.some(v => !Number.isFinite(v)) || y.some(v => v !== 0 && v !== 1)) {
      throw new AnalysisError("The model needs matching finite card values and binary responses.");
    }
    if (new Set(x).size !== x.length) throw new AnalysisError("This calculator requires one distinct card value per trial.");
    const n = x.length;
    const ones = y.reduce((s, v) => s + v, 0);
    if (ones === 0 || ones === n) throw new AnalysisError("All cards are assigned to the same category. A finite logistic model and PSE cannot be estimated without both response categories.");
    const zerosX = x.filter((_, i) => y[i] === 0);
    const onesX = x.filter((_, i) => y[i] === 1);
    if (Math.max(...zerosX) < Math.min(...onesX) || Math.max(...onesX) < Math.min(...zerosX)) {
      throw new AnalysisError("Complete separation: the responses switch category without any overlap. The ordinary logistic slope has no finite maximum-likelihood estimate, so a model-based PSE and Hosmer–Lemeshow result are not reported. Check the original classifications; do not change valid responses to force a fit.");
    }
    const center = x.reduce((s, v) => s + v, 0) / n;
    const scale = Math.sqrt(x.reduce((s, v) => s + (v - center) ** 2, 0) / n);
    if (!(scale > 0)) throw new AnalysisError("At least two distinct card values are required.");
    const z = x.map(value => (value - center) / scale);
    let a = Math.log(ones / (n - ones));
    let b = 0;
    let ll = logLikelihood(z, y, a, b);
    let converged = false;
    let iterations = 0;

    // Newton / Fisher scoring with step halving; standardized x improves conditioning.
    for (let iter = 0; iter < 100; iter++) {
      iterations = iter + 1;
      let s0 = 0, s1 = 0, h00 = 0, h01 = 0, h11 = 0;
      for (let i = 0; i < n; i++) {
        const eta = a + b * z[i];
        const p = sigmoid(eta);
        const q = sigmoid(-eta);
        const w = p * q;
        // Avoid subtracting two values close to one for a positive response.
        const residual = y[i] ? q : -p;
        s0 += residual;
        s1 += residual * z[i];
        h00 += w;
        h01 += w * z[i];
        h11 += w * z[i] * z[i];
      }
      if (Math.max(Math.abs(s0), Math.abs(s1)) < 1e-11) { converged = true; break; }
      const det = h00 * h11 - h01 * h01;
      if (!Number.isFinite(det) || det <= 1e-20) break;
      const da = (h11 * s0 - h01 * s1) / det;
      const db = (h00 * s1 - h01 * s0) / det;
      let step = 1, nextLL;
      while (step >= 2 ** -30) {
        nextLL = logLikelihood(z, y, a + step * da, b + step * db);
        if (Number.isFinite(nextLL) && nextLL >= ll - 1e-12) break;
        step /= 2;
      }
      if (step < 2 ** -30) break;
      a += step * da;
      b += step * db;
      ll = nextLL;
      if (Math.max(Math.abs(step * da), Math.abs(step * db)) < 1e-11) { converged = true; break; }
    }
    if (!converged || !Number.isFinite(a) || !Number.isFinite(b)) {
      throw new AnalysisError("The maximum-likelihood fit did not converge to a stable finite solution. No estimates are reported. Inspect the card classifications.");
    }
    const beta1 = b / scale;
    const beta0 = a - beta1 * center;
    const flat = Math.abs(beta1 * (Math.max(...x) - Math.min(...x))) < 1e-8;
    const pse = flat ? null : center - scale * a / b;
    const predicted = z.map(value => sigmoid(a + b * value));
    return { beta0, beta1, pse, flat, predicted, logLikelihood: ll, iterations, center, scale, a, b };
  }

  // Lanczos log-gamma and regularized upper incomplete gamma Q(a,x).
  // The chi-square survival function is Q(df/2, chiSquare/2).
  function logGamma(z) {
    const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < c.length; i++) x += c[i] / (z + i + 1);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function gammaQ(a, x) {
    if (!(a > 0) || x < 0 || Number.isNaN(x)) return NaN;
    if (x === 0) return 1;
    if (x === Infinity) return 0;
    const logScale = a * Math.log(x) - x - logGamma(a);
    let result;
    if (x < a + 1) {
      let term = 1 / a, sum = term, ap = a;
      for (let i = 0; i < 10000; i++) {
        ap += 1; term *= x / ap; sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
      }
      result = 1 - sum * Math.exp(logScale);
    } else {
      const tiny = 1e-300;
      let b = x + 1 - a, c = 1 / tiny, d = 1 / b, h = d;
      for (let i = 1; i < 10000; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < tiny) d = tiny;
        c = b + an / c;
        if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d;
        const delta = d * c;
        h *= delta;
        if (Math.abs(delta - 1) < 1e-14) break;
      }
      result = Math.exp(logScale) * h;
    }
    return Math.max(0, Math.min(1, result));
  }

  function quantileType7(sorted, probability) {
    const position = (sorted.length - 1) * probability;
    const lo = Math.floor(position), hi = Math.ceil(position);
    return sorted[lo] + (position - lo) * (sorted[hi] - sorted[lo]);
  }

  function hosmerLemeshow(y, predicted, requestedGroups = 10) {
    if (!Number.isInteger(requestedGroups) || requestedGroups < 3 || requestedGroups > 20) {
      throw new AnalysisError("Choose 3 to 20 Hosmer–Lemeshow groups.", "hl-groups");
    }
    if (y.length !== predicted.length || !y.length || predicted.some(p => !Number.isFinite(p) || p < 0 || p > 1)) {
      throw new AnalysisError("Invalid probabilities supplied to the goodness-of-fit calculation.");
    }
    const sorted = [...predicted].sort((a, b) => a - b);
    const cuts = [...new Set(Array.from({ length: requestedGroups + 1 }, (_, i) => quantileType7(sorted, i / requestedGroups)))];
    const bins = Array.from({ length: Math.max(0, cuts.length - 1) }, () => ({ n: 0, observed0: 0, observed1: 0, expected0: 0, expected1: 0 }));
    if (!bins.length) return { available: false, reason: "All fitted probabilities are identical; quantile groups cannot be formed.", groups: [], requestedGroups, actualGroups: 0 };
    for (let i = 0; i < y.length; i++) {
      // R cut(..., include.lowest=TRUE): right-closed bins, first bin includes min.
      let index = 0;
      while (index < bins.length - 1 && predicted[i] > cuts[index + 1]) index++;
      const bin = bins[index];
      bin.n++;
      bin.observed1 += y[i];
      bin.observed0 += 1 - y[i];
      bin.expected1 += predicted[i];
      bin.expected0 += 1 - predicted[i];
    }
    const groups = bins.filter(bin => bin.n > 0);
    const actualGroups = groups.length, df = actualGroups - 2;
    const base = { groups, actualGroups, requestedGroups, df };
    if (df <= 0) return { ...base, available: false, reason: "Fewer than three nonempty probability groups; the chi-square reference test is unavailable." };
    if (groups.some(bin => bin.expected0 <= 0 || bin.expected1 <= 0)) {
      return { ...base, available: false, reason: "A group has zero expected responses in one category because fitted probabilities reach numerical limits." };
    }
    const chiSquare = groups.reduce((sum, bin) => sum + (bin.observed0 - bin.expected0) ** 2 / bin.expected0 + (bin.observed1 - bin.expected1) ** 2 / bin.expected1, 0);
    const pValue = gammaQ(df / 2, chiSquare / 2);
    const smallCells = groups.reduce((sum, bin) => sum + Number(bin.expected0 < 5) + Number(bin.expected1 < 5), 0);
    return { ...base, available: true, chiSquare, pValue, smallCells };
  }

  function analyze(data, requestedGroups = 10) {
    const fit = fitLogistic(data.x, data.y);
    const hl = hosmerLemeshow(data.y, fit.predicted, requestedGroups);
    const warnings = [];
    if (fit.flat) warnings.push("The fitted function is effectively flat. A unique 50% threshold cannot be identified; PSE is not reported.");
    if (fit.beta1 < 0 && !fit.flat) warnings.push("The slope is negative: full-glare responses decrease as card value increases. Check the card values and response category against the original record.");
    if (fit.pse !== null && (fit.pse < Math.min(...data.x) || fit.pse > Math.max(...data.x))) warnings.push("The PSE lies outside the tested card range. It is an extrapolated threshold and is not shown as a marker inside the plot.");
    if (!hl.available) warnings.push(`Hosmer–Lemeshow unavailable: ${hl.reason}`);
    if (hl.actualGroups !== requestedGroups) warnings.push(`Hosmer–Lemeshow uses ${hl.actualGroups} nonempty groups instead of the requested ${requestedGroups}; tied probabilities or a small deck reduce the number of groups.`);
    if (hl.available && hl.pValue < 0.05) warnings.push("Hosmer–Lemeshow p < 0.05: evidence of lack of fit under the chi-square approximation.");
    return { data, fit, hl, warnings };
  }

  const api = { AnalysisError, parseCardList, makeData, sigmoid, fitLogistic, quantileType7, hosmerLemeshow, gammaQ, analyze };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.GETStats = api;
  if (typeof document === "undefined") return;

  const $ = id => document.getElementById(id);
  let currentResult = null;
  let exampleActive = false;
  const fmt = (value, digits = 3) => value === null || !Number.isFinite(value) ? "Not estimable" :
    ((Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 10 ** -digits)) ? value.toExponential(2) : value.toFixed(digits));
  const pText = value => value < 0.001 ? "p < 0.001" : `p = ${value.toFixed(3)}`;
  const svgNS = "http://www.w3.org/2000/svg";

  function svgElement(name, attrs = {}, text) {
    const element = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function drawPlot(result = null) {
    const width = 780, height = 510;
    const left = 79, right = 750, top = 26, bottom = 426;
    const count = Number($("card-count").value);
    let low = 1, high = Number.isInteger(count) && count >= 3 && count <= 100 ? count : 99;
    if (result) { low = Math.min(...result.data.x); high = Math.max(...result.data.x); }
    const span = high - low;
    const xMin = Math.max(0, low - span * .025), xMax = high + span * .025;
    const sx = x => left + (x - xMin) / (xMax - xMin) * (right - left);
    const sy = y => bottom - (y + .04) / 1.08 * (bottom - top);
    const svg = svgElement("svg", { xmlns: svgNS, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-labelledby": "chart-svg-title chart-svg-desc", "font-family": "Arial, Helvetica, sans-serif", "font-size": 15, fill: "#202827" });
    svg.append(svgElement("title", { id: "chart-svg-title" }, "Glare Effect Test psychometric function"));
    svg.append(svgElement("desc", { id: "chart-svg-desc" }, result ? `Binary full-glare responses by card value, fitted logistic curve in red. PSE ${fmt(result.fit.pse, 2)}, logit slope ${fmt(result.fit.beta1, 4)}. Dashed lines indicate probability 0.5 and the PSE when within range.` : "No data yet. Enter card classifications and calculate to show observed responses and the fitted curve."));
    svg.append(svgElement("rect", { width, height, fill: "#fff" }));
    svg.append(svgElement("rect", { x: left, y: top, width: right - left, height: bottom - top, fill: "#fff", stroke: result ? "#202827" : "#d9e1db", "stroke-width": 1 }));
    for (const value of [0, .5, 1]) {
      svg.append(svgElement("line", { x1: left - 8, x2: left, y1: sy(value), y2: sy(value), stroke: "#202827", "stroke-width": 1 }));
      svg.append(svgElement("text", { x: left - 16, y: sy(value) + 5, "text-anchor": "end" }, String(value)));
    }
    const rawStep = (xMax - xMin) / 5;
    const power = 10 ** Math.floor(Math.log10(rawStep));
    const fraction = rawStep / power;
    const step = Math.max(1, (fraction <= 1.5 ? 1 : fraction <= 3 ? 2 : fraction <= 7 ? 5 : 10) * power);
    for (let value = Math.ceil(xMin / step) * step; value <= xMax + 1e-9; value += step) {
      svg.append(svgElement("line", { x1: sx(value), x2: sx(value), y1: bottom, y2: bottom + 9, stroke: "#202827", "stroke-width": 1 }));
      svg.append(svgElement("text", { x: sx(value), y: bottom + 32, "text-anchor": "middle" }, String(Number(value.toFixed(4)))));
    }
    svg.append(svgElement("text", { x: (left + right) / 2, y: 494, "text-anchor": "middle", "font-size": 16 }, "Glare effect intensity (card value)"));
    svg.append(svgElement("text", { transform: `translate(23 ${(top + bottom) / 2}) rotate(-90)`, "text-anchor": "middle", "font-size": 16 }, "Probability of full-glare response"));
    if (result) {
      const { data, fit } = result;
      const marker = fit.pse !== null && fit.pse >= low && fit.pse <= high;
      if (marker) {
        svg.append(svgElement("path", { d: `M ${left} ${sy(.5)} H ${sx(fit.pse)} V ${bottom}`, fill: "none", stroke: "#1d2523", "stroke-width": 1.2, "stroke-dasharray": "6 5" }));
      }
      for (let i = 0; i < data.x.length; i++) {
        const circle = svgElement("circle", { cx: sx(data.x[i]), cy: sy(data.y[i]), r: 3.3, fill: "#111", class: "observed-point" });
        circle.append(svgElement("title", {}, `Card ${data.x[i]}: ${data.y[i] ? "full glare (1)" : "no effect (0)"}; fitted p = ${fit.predicted[i].toFixed(4)}`));
        svg.append(circle);
      }
      let path = "";
      for (let i = 0; i <= 600; i++) {
        const x = low + span * i / 600;
        const p = sigmoid(fit.a + fit.b * (x - fit.center) / fit.scale);
        path += `${i === 0 ? "M" : "L"}${sx(x).toFixed(3)},${sy(p).toFixed(3)} `;
      }
      svg.append(svgElement("path", { d: path, fill: "none", stroke: "#e52d33", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", class: "fitted-curve" }));
      if (marker) {
        const px = sx(fit.pse), py = sy(.5);
        svg.append(svgElement("path", { d: `M${px - 10} ${py}H${px + 10} M${px} ${py - 10}V${py + 10}`, stroke: "#111", "stroke-width": 2, class: "pse-marker" }));
        const labelRight = px < right - 130;
        svg.append(svgElement("text", { x: px + (labelRight ? 15 : -15), y: py - 15, "text-anchor": labelRight ? "start" : "end", "font-size": 13, fill: "#425c54" }, `PSE ${fmt(fit.pse, 2)}`));
      }
    } else {
      svg.append(svgElement("line", { x1: left, x2: right, y1: sy(.5), y2: sy(.5), stroke: "#e6ebe6", "stroke-dasharray": "5 6" }));
      svg.append(svgElement("rect", { x: 185, y: 180, width: 460, height: 90, rx: 12, fill: "#fff" }));
      svg.append(svgElement("text", { x: (left + right) / 2, y: 216, "text-anchor": "middle", fill: "#516d60", "font-size": 20 }, "Your psychometric curve will appear here"));
      svg.append(svgElement("text", { x: (left + right) / 2, y: 244, "text-anchor": "middle", fill: "#84938a", "font-size": 14 }, "Enter the card classifications, then calculate."));
    }
    $("plot-container").replaceChildren(svg);
  }

  function clearError() {
    $("input-error").hidden = true;
    document.querySelectorAll("[aria-invalid]").forEach(element => element.removeAttribute("aria-invalid"));
  }
  function resetResults(status = "Awaiting data") {
    currentResult = null;
    $("pse-value").textContent = $("slope-value").textContent = $("hl-value").textContent = "—";
    $("pse-detail").textContent = "Point of subjective equivalence";
    $("slope-detail").textContent = "β₁ · log-odds per card unit";
    $("hl-detail").textContent = "Goodness-of-fit p-value";
    $("analysis-status").textContent = status;
    $("analysis-status").classList.remove("ready");
    $("fit-messages").hidden = true;
    $("fitted-model").hidden = $("group-details").hidden = true;
    $("download-plot").disabled = $("download-results").disabled = true;
    $("trial-summary").textContent = "Enter classifications to fit the curve.";
    drawPlot();
  }
  function refreshInputs() {
    const custom = $("deck-mode").value === "custom";
    $("custom-deck-field").hidden = !custom;
    $("even-deck-button").hidden = !custom || Number($("card-count").value) !== 49;
    $("administered-cards").disabled = !custom;
    const type = document.querySelector('input[name="responseType"]:checked').value;
    $("response-label").textContent = type === "glare" ? "Cards classified as full glare" : "Cards classified as no effect";
    const tokens = $("response-cards").value.trim().split(",").filter(v => v.trim());
    $("input-count").textContent = `${tokens.length} entered`;
    $("deck-summary").textContent = custom ? "Analysis values: custom card values · references excluded" : `Analysis values: 1–${$("card-count").value || "N"} · references excluded`;
  }
  function showResult(result) {
    currentResult = result;
    const { data, fit, hl, warnings } = result;
    $("pse-value").textContent = fit.pse === null ? "Undefined" : fmt(fit.pse, 2);
    $("pse-detail").textContent = fit.pse === null ? "No identifiable 50% threshold" : "Card value at p = 0.5";
    $("slope-value").textContent = fmt(fit.beta1, 4);
    $("hl-value").textContent = hl.available ? pText(hl.pValue) : "Unavailable";
    $("hl-detail").textContent = hl.available ? `χ² = ${fmt(hl.chiSquare, 3)} · df = ${hl.df} · ${hl.actualGroups} groups` : "See estimation notes below";
    $("analysis-status").textContent = exampleActive ? "Synthetic example" : "Fit complete";
    $("analysis-status").classList.add("ready");
    $("fit-messages").replaceChildren();
    const notices = exampleActive ? ["Synthetic example only. Replace these classifications with your participant’s data.", ...warnings] : warnings;
    for (const warning of notices) {
      const p = document.createElement("p"); p.textContent = warning; $("fit-messages").append(p);
    }
    $("fit-messages").hidden = notices.length === 0;
    const ones = data.y.reduce((s, v) => s + v, 0);
    $("trial-summary").textContent = `${data.count} trials · ${ones} full glare · ${data.count - ones} no effect · card values ${data.x[0]}–${data.x[data.x.length - 1]}`;
    $("fitted-model").textContent = `Fitted model: logit(p) = ${fmt(fit.beta0, 6)} ${fit.beta1 < 0 ? "−" : "+"} ${fmt(Math.abs(fit.beta1), 6)} × card value. Log likelihood = ${fmt(fit.logLikelihood, 6)}. Requested H–L groups: ${hl.requestedGroups}.`;
    $("fitted-model").hidden = false;
    $("group-table").replaceChildren();
    hl.groups.forEach((group, i) => {
      const tr = document.createElement("tr");
      [i + 1, group.n, group.observed0, fmt(group.expected0, 3), group.observed1, fmt(group.expected1, 3)].forEach(value => {
        const td = document.createElement("td"); td.textContent = value; tr.append(td);
      });
      $("group-table").append(tr);
    });
    $("group-details").hidden = hl.groups.length === 0;
    $("download-plot").disabled = $("download-results").disabled = false;
    drawPlot(result);
  }
  function calculate(event) {
    if (event) event.preventDefault();
    clearError();
    resetResults();
    try {
      const data = makeData(Number($("card-count").value), $("deck-mode").value, $("administered-cards").value, $("response-cards").value, document.querySelector('input[name="responseType"]:checked').value);
      const result = analyze(data, Number($("hl-groups").value));
      showResult(result);
      if (window.matchMedia("(max-width: 900px)").matches) $("results-title").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    } catch (error) {
      $("input-error").textContent = error instanceof AnalysisError ? error.message : "The calculation could not be completed. Check the entered values.";
      $("input-error").hidden = false;
      $("analysis-status").textContent = "Check input";
      const field = $(error.field || "response-cards");
      if (field) {
        if (field.closest(".deck-settings")) $("deck-settings").open = true;
        field.setAttribute("aria-invalid", "true"); field.focus();
      }
      if (!(error instanceof AnalysisError)) console.error(error);
    }
  }
  function download(text, type, filename) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a"); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function csvCell(value) { return `"${String(value === null || value === undefined ? "" : value).replace(/"/g, '""')}"`; }

  $("analysis-form").addEventListener("submit", calculate);
  $("analysis-form").addEventListener("input", () => {
    const hadResult = currentResult !== null;
    exampleActive = false; clearError(); refreshInputs(); resetResults(hadResult ? "Inputs changed · recalculate" : "Awaiting calculation");
  });
  $("example-button").addEventListener("click", () => {
    $("card-count").value = "99";
    $("deck-mode").value = "consecutive";
    $("administered-cards").value = "";
    $("hl-groups").value = "10";
    document.querySelector('input[name="responseType"][value="glare"]').checked = true;
    // Deliberate response overlap; this is a synthetic illustration, not study data.
    const example = Array.from({ length: 99 }, (_, i) => i + 1).filter(x => x >= 50 ? x !== 52 && x !== 56 : [42, 47, 49].includes(x));
    $("response-cards").value = example.join(", ");
    exampleActive = true; refreshInputs(); calculate();
  });
  $("even-deck-button").addEventListener("click", () => {
    $("administered-cards").value = Array.from({ length: 49 }, (_, i) => 2 * (i + 1)).join(", ");
    exampleActive = false; clearError(); refreshInputs(); resetResults("Inputs changed · recalculate");
  });
  $("clear-button").addEventListener("click", () => {
    $("response-cards").value = ""; exampleActive = false; clearError(); refreshInputs(); resetResults(); $("response-cards").focus();
  });
  $("download-plot").addEventListener("click", () => {
    if (!currentResult) return;
    const source = new XMLSerializer().serializeToString($("plot-container").querySelector("svg"));
    download('<?xml version="1.0" encoding="UTF-8"?>\n' + source, "image/svg+xml;charset=utf-8", "glare-effect-psychometric-function.svg");
  });
  $("download-results").addEventListener("click", () => {
    if (!currentResult) return;
    const { data, fit, hl, warnings } = currentResult;
    const rows = [["card_value", "response_full_glare", "predicted_probability", "PSE", "logit_intercept", "logit_slope", "HL_chi_square", "HL_df", "HL_p_value", "HL_groups_requested", "HL_groups_used", "entered_category", "deck_mode", "n_trials", "synthetic_example", "notes"]];
    data.x.forEach((x, i) => rows.push([x, data.y[i], fit.predicted[i], fit.pse, fit.beta0, fit.beta1, hl.available ? hl.chiSquare : null, hl.available ? hl.df : null, hl.available ? hl.pValue : null, hl.requestedGroups, hl.actualGroups, data.responseType, data.mode, data.count, exampleActive, warnings.join(" | ")]));
    download("\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8", "glare-effect-results.csv");
  });
  refreshInputs();
  drawPlot();
})(typeof globalThis !== "undefined" ? globalThis : this);
