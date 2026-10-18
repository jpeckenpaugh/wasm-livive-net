/**
 * wasm.livive.net - Interactive module
 * - Fetches & renders data/projects.json with interactive category filtering
 * - Inline WebAssembly recursive Fibonacci module compiled to 61-byte bytecode
 * - Fair side-by-side benchmark with JS (warm-up passes, multi-run average, boundary note)
 */

// Embedded 61-byte WebAssembly binary for recursive Fibonacci
// (module
//   (func $fib (param $n i32) (result i32)
//     local.get $n
//     i32.const 2
//     i32.lt_s
//     if (result i32)
//       local.get $n
//     else
//       local.get $n
//       i32.const 1
//       i32.sub
//       call 0
//       local.get $n
//       i32.const 2
//       i32.sub
//       call 0
//       i32.add
//     end
//   )
//   (export "fib" (func 0))
// )
const FIB_WASM_BYTES = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x06, 0x01, 0x60, 0x01, 0x7f, 0x01, 0x7f,
  0x03, 0x02, 0x01, 0x00,
  0x07, 0x07, 0x01, 0x03, 0x66, 0x69, 0x62, 0x00, 0x00,
  0x0a, 0x1e, 0x01, 0x1c, 0x00,
  0x20, 0x00,
  0x41, 0x02,
  0x48,
  0x04, 0x7f,
  0x20, 0x00,
  0x05,
  0x20, 0x00,
  0x41, 0x01,
  0x6b,
  0x10, 0x00,
  0x20, 0x00,
  0x41, 0x02,
  0x6b,
  0x10, 0x00,
  0x6a,
  0x0b,
  0x0b
]);

// Pure JavaScript recursive Fibonacci for direct algorithmic comparison
function jsFib(n) {
  if (n < 2) return n;
  return jsFib(n - 1) + jsFib(n - 2);
}

let wasmInstance = null;

// Initialize WASM instance
async function initWasm() {
  try {
    const { instance } = await WebAssembly.instantiate(FIB_WASM_BYTES);
    wasmInstance = instance;
    console.log("WebAssembly Fibonacci initialized (61 bytes).");
  } catch (err) {
    console.error("Failed to compile inline WebAssembly module:", err);
  }
}

// Render Project Card Helper
function renderProjectCard(p) {
  const isControl = p.status === "control";
  return `
    <article class="project-card ${isControl ? 'is-control' : ''}" data-category="${escapeHtml(p.category)}">
      <div class="card-top">
        <div class="card-header-meta">
          <h3 class="card-title">${escapeHtml(p.title)}</h3>
          <div class="card-badges">
            ${isControl 
              ? `<span class="badge badge-control">Non-WASM Control</span>`
              : `<span class="badge badge-route">${escapeHtml(p.wasmRoute)}</span>`
            }
            <span class="badge badge-category">${escapeHtml(p.category)}</span>
          </div>
        </div>
        <p class="card-what-it-does">${escapeHtml(p.whatItDoes)}</p>

        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">What is WASM</span>
            <span class="detail-value">${escapeHtml(p.whatIsWasm)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">What is NOT WASM</span>
            <span class="detail-value">${escapeHtml(p.whatIsNotWasm)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              <span class="tag-inferred">Inferred</span> Why WASM here
            </span>
            <span class="detail-value">${escapeHtml(p.whyWasmInferred)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Alternative Considered</span>
            <span class="detail-value">${escapeHtml(p.alternativeConsidered)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              <span class="tag-confirmed">Measured</span> Footprint & Startup
            </span>
            <span class="detail-value">
              <strong>${escapeHtml(p.footprint.raw)}</strong>
              ${p.footprint.gzip ? `<br><small style="color:var(--text-dim)">Gzip: ${escapeHtml(p.footprint.gzip)}</small>` : ''}
              <br><small style="color:var(--text-dim)">${escapeHtml(p.footprint.method)}</small>
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Network & CDN Notes</span>
            <span class="detail-value"><small>${escapeHtml(p.networkNote)}</small></span>
          </div>
        </div>
      </div>

      <div class="card-footer-links">
        ${p.liveUrl && !isControl ? `<a href="${escapeHtml(p.liveUrl)}" class="card-link live" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : ''}
        <a href="${escapeHtml(p.repoUrl)}" class="card-link repo" target="_blank" rel="noopener noreferrer">Source Repo ↗</a>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fetch and render projects
async function loadProjects() {
  const container = document.getElementById("projects-gallery");
  if (!container) return;

  try {
    const res = await fetch("data/projects.json");
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const projects = await res.json();
    window.__ALL_PROJECTS = projects;

    container.innerHTML = projects.map(renderProjectCard).join("");
    setupFilters(projects);
  } catch (err) {
    console.error("Failed to load projects.json:", err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
        <p style="color: #fca5a5;">Unable to fetch project records via dynamic fetch. Verify local static server or file permissions.</p>
      </div>
    `;
  }
}

// Filter handling
function setupFilters(projects) {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === "all") {
          card.style.display = "flex";
        } else if (filter === "control") {
          card.style.display = card.classList.contains("is-control") ? "flex" : "none";
        } else {
          const cat = card.dataset.category;
          card.style.display = (cat === filter) ? "flex" : "none";
        }
      });
    });
  });
}

// Benchmark implementation
async function runBenchmark() {
  const runBtn = document.getElementById("run-bench-btn");
  const inputN = document.getElementById("bench-n");
  const wasmTimeEl = document.getElementById("wasm-time");
  const jsTimeEl = document.getElementById("js-time");
  const wasmResEl = document.getElementById("wasm-res");
  const jsResEl = document.getElementById("js-res");
  const summaryEl = document.getElementById("bench-summary");

  if (!wasmInstance) {
    await initWasm();
    if (!wasmInstance) {
      alert("WebAssembly is not supported or failed to instantiate.");
      return;
    }
  }

  const n = parseInt(inputN.value, 10) || 35;
  if (n < 1 || n > 43) {
    alert("Please choose an N between 1 and 43 to avoid browser UI lockup.");
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = "Computing...";
  wasmTimeEl.textContent = "...";
  jsTimeEl.textContent = "...";
  wasmResEl.textContent = "Computing...";
  jsResEl.textContent = "Computing...";
  summaryEl.textContent = "Running 3 warm-up cycles, then measuring 5 consecutive iterations...";

  // Let UI repaint
  await new Promise(r => setTimeout(r, 50));

  try {
    const wasmFib = wasmInstance.exports.fib;

    // 1. Warm-up passes (prevent JIT cold-start bias on either engine)
    for (let i = 0; i < 3; i++) {
      wasmFib(20);
      jsFib(20);
    }

    const ITERATIONS = 5;

    // 2. Measure WebAssembly
    const wasmTimes = [];
    let wasmVal = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      wasmVal = wasmFib(n);
      const t1 = performance.now();
      wasmTimes.push(t1 - t0);
    }
    const wasmAvg = wasmTimes.reduce((a, b) => a + b, 0) / ITERATIONS;

    // 3. Measure JavaScript
    const jsTimes = [];
    let jsVal = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      jsVal = jsFib(n);
      const t1 = performance.now();
      jsTimes.push(t1 - t0);
    }
    const jsAvg = jsTimes.reduce((a, b) => a + b, 0) / ITERATIONS;

    // Display results
    wasmTimeEl.textContent = `${wasmAvg.toFixed(2)} ms`;
    wasmResEl.textContent = `fib(${n}) = ${wasmVal.toLocaleString()} (avg of ${ITERATIONS} runs)`;

    jsTimeEl.textContent = `${jsAvg.toFixed(2)} ms`;
    jsResEl.textContent = `fib(${n}) = ${jsVal.toLocaleString()} (avg of ${ITERATIONS} runs)`;

    const diff = (jsAvg / wasmAvg).toFixed(2);
    if (wasmAvg < jsAvg) {
      summaryEl.innerHTML = `<strong>Result:</strong> WebAssembly was <strong>${diff}x faster</strong> than JavaScript on this CPU-bound recursive calculation in your browser engine.`;
    } else {
      const reverseDiff = (wasmAvg / jsAvg).toFixed(2);
      summaryEl.innerHTML = `<strong>Result:</strong> Modern V8/JavaScript JIT performed comparably (JS was <strong>${reverseDiff}x faster</strong> or equal) due to recursive inlining optimizations.`;
    }
  } catch (err) {
    console.error("Benchmark error:", err);
    summaryEl.textContent = `Benchmark error: ${err.message}`;
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "Run Benchmark Again";
  }
}

// DOM Setup
document.addEventListener("DOMContentLoaded", async () => {
  await initWasm();
  await loadProjects();

  const benchBtn = document.getElementById("run-bench-btn");
  if (benchBtn) {
    benchBtn.addEventListener("click", runBenchmark);
  }
});
