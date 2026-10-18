# Research Findings: WASM Claim Verification

Source: research sub-agent reading `jpeckenpaugh/*` repos via the GitHub API. The API rate limit ran out partway through, so some items are unclear. Nothing was executed, so there are no measured timings.

## Per project

### aom
- **Pygbag: confirmed.** `pygbag==0.9.3`, Python 3.14, built in CI (`.github/workflows/pages.yml`, README).
- Bundle `aom.tar.gz` is about 63 MB with the atlas profile, down from about 143 MB. CI fails above a 75 MB ceiling.
- Pygbag is not Pyodide.
- No stated rationale for WASM. Tests and raw assets live in a private repo.

### EuchreGame
- **Pyodide: confirmed.** `html/main.js` calls `loadPyodide` on a vendored runtime. `pyodide.asm.wasm` is 8.65 MB and `python_stdlib.zip` is 2.42 MB, about 11 MB uncompressed.
- **Same engine in browser and tests: confirmed.** `html/python/game_bridge.py` and `tests/test_game.py` both import `euchre_game`, and the deploy workflow copies `euchre_game/*.py` into `html/`.
- **WebLLM: refuted for current code.** `main.js` uses MediaPipe GenAI (LiteRT) with a local `gemma-4-E2B-it-web.task`. `html/vendor/model-libs/README.md` calls WebLLM legacy. The repo README is stale.
- Inference runs on WebGPU (the MediaPipe README says models must be GPU-encoded). The 26 MB `genai_wasm_internal.wasm` is runtime glue. The Gemma model file is user-supplied.

### lokarta
- **Pyodide: confirmed.** `docs/main.js` loads v0.29.2 from the jsDelivr CDN, with xterm.js and saves in IDBFS (`TODO_Pyodide.md`, `docs/WEB.md`).
- The repo README only describes a local terminal POC.

### rl-livive-net
- **Pyodide 0.23.4 and ONNX Runtime Web 1.19.2 (both CDN): confirmed.**
- **Execution is WASM CPU only.** `src/models.js` sets `executionProviders:["wasm"]`, and `index.html` says "WebAssembly CPU backend". No WebGPU.
- Physics is PyPyBox2D (pure Python) behind a Gymnasium shim, installed with micropip. There are 9 ONNX policies.
- The PPO model is fetched from Hugging Face at build time only.

### p2p-ttt
- **sql.js: confirmed.** Vendored, running in a Web Worker.
- **OPFS: confirmed; IndexedDB is not used.** `js/db/persistence.js` uses `navigator.storage.getDirectory`. sql.js runs in memory, and `db.export()` rewrites the whole `game.db` file to OPFS on each persist. It does not use the SQLite OPFS VFS.
- **WebRTC: confirmed.** `new RTCPeerConnection()` is created with no config, so there is no STUN or TURN. The data channel is `game`.
- Signalling is manual: SDP compressed into `#z` links or QR codes (jsQR, qrcode-generator). No signalling server (`docs/architecture.md`).
- Inference, untested: connections across NATs may fail without STUN.
- The "IndexedDB has no query engine" rationale is the README's inference, not stated in the repo.

### rag-poc
- **Transformers.js 3.0.2 for embeddings: confirmed.**
- **WASM backend: likely, not verified in repo.** `embeddings.ts` sets `onnx.wasm.numThreads=1` and passes no device. The v3 browser default is believed to be WASM.
- Generation uses `@mlc-ai/web-llm` on WebGPU (Llama-3.2-1B, about 880 MB). It falls back to retrieval-only without `navigator.gpu`. So the app is mixed: WASM for embeddings, WebGPU for the LLM.
- "Zero backend" holds for hosting. `allowLocalModels=false` means HF models are downloaded at runtime.
- The README's vector search figure (under 2 ms over 367 chunks) is a README claim, not a WASM benchmark.

### ai_chat_distil_01
- **LiteRT.js: confirmed.** `html/tflite_demo.html` imports `loadLiteRt`/`loadAndCompile` from vendored litertjs. The vendor dir has WASM builds only (standard, compat, threaded).
- **Backend (WASM vs WebGPU): unclear.** Compile options were not read. Likely WASM.
- It is **not a chat model.** The README title is "Closed-System Speech POC": small TFLite models reconstruct speech waveforms for "hello"/"goodbye".

### vibe-tic-tac-toe
- **No WASM (refuted).** Static HTML/CSS/JS plus localStorage; `index.html` loads only `script.js`. It is the control in a "Tic-Tac-Toe Trilogy" with fast-ttt and p2p-ttt.

## Cross-cutting
- No repo has a WASM-vs-JS or WASM-vs-WebGPU benchmark. The only numbers are AoM's bundle sizes and rag-poc's README search time.
- "WebGPU often faster for heavy ML" has no support in the repos. Cite a source or soften it.
- No repo states a "why WASM instead of Node" rationale. The README's rationales are inferred.
- "No backend" is true for hosting. "Data stays on device" needs caveats because of runtime CDN fetches (Pyodide, ONNX Runtime) and HF model downloads.
- Pyodide versions differ: 0.23.4 (rl), 0.29.2 (lokarta), unchecked (Euchre). The "~10 MB" figure is about right (about 11 MB uncompressed in Euchre). Transfer size was not measured.

## Corrections to README
1. EuchreGame: "Pyodide (+ MediaPipe GenAI/LiteRT, WebGPU, local Gemma)" instead of WebLLM.
2. Lokarta: remove (verify). Pyodide is confirmed.
3. LunarLander: ORT Web 1.19.2 on the WASM CPU provider, Pyodide 0.23.4, PyPyBox2D, 9 policies.
4. p2p-ttt: whole DB exported to an OPFS file; WebRTC pairing is manual QR/link signalling with no STUN. Mark the IndexedDB rationale as inferred.
5. rag-poc: Transformers.js embeddings on WASM plus WebLLM on WebGPU for generation. Remove (verify). Note the runtime HF downloads.
6. ai_chat_distil_01: describe as a speech-reconstruction POC, not chat. Mark the backend as unconfirmed.
7. AoM: add the 63 MB vs 143 MB bundle size, and note that Pygbag is not Pyodide.
8. Optionally add vibe-tic-tac-toe as a non-WASM control.
9. Soften "data stays on device" and "WebGPU often faster".
10. Keep all "why WASM" rationales labelled as inferred until the author confirms.

## Round 2

Method: shallow clones in `scratch/` (gitignored) of EuchreGame (c2a87ec), p2p-ttt (36963d4), ai_chat_distil_01 (d2e70f7), rag-poc. Network fetches from CDNs and doc sites (jsDelivr, unpkg, MDN, webassembly.org, nodejs.org, huggingface.co, onnxruntime.ai) were blocked or denied by the sandbox/permission policy. I did not work around that. Items that depended on them are marked unclear or unfetched.

### 1. ai_chat_distil_01 backend: CONFIRMED WASM
- `scratch/ai_chat_distil_01/html/tflite_demo.html` L142-143: `await window.LiteRt.loadLiteRt("./vendor/litertjs/core/wasm/")` then `loadAndCompile(modelUrl, {accelerator: "wasm"})`.
- The accelerator is explicitly `"wasm"`, so no WebGPU. This replaces the earlier "unclear".
- Repo: https://github.com/jpeckenpaugh/ai_chat_distil_01/blob/main/html/tflite_demo.html

### 2. rag-poc Transformers.js backend: PARTLY CONFIRMED (repo side confirmed, library default unclear)
- `package.json` pins `@huggingface/transformers` 3.0.2 (exact).
- Config is in `src/workers/embeddingWorker.ts`, not `embeddings.ts`. That file only manages the worker. The worker sets `env.allowLocalModels=false`, `env.useBrowserCache=true` and `env.backends.onnx.wasm.numThreads=1`. It then calls `pipeline('feature-extraction', modelId, {quantized: true})` with **no `device` option**.
- Library default: **unclear, not verified from the library source.** The doc pages could not be fetched. An uncited web-search summary says the browser default is `wasm` and WebGPU needs `device:'webgpu'`. That matches the README's claim, but it is not primary evidence. To close it, read `src/utils/devices.js` and `src/backends/onnx.js` at tag 3.0.2 of github.com/huggingface/transformers.js.
- The repo-side facts are solid: no `device` is passed, and wasm-specific tuning (`numThreads`) is set.

### 3. EuchreGame Pyodide version: CONFIRMED 0.29.3
- `scratch/EuchreGame/html/vendor/pyodide/package.json`: `"version": "0.29.3"`.
- Pyodide versions across projects: 0.23.4 (rl), 0.29.2 (lokarta, CDN), 0.29.3 (Euchre, vendored). This fills the gap in the Cross-cutting notes.

### 4. Compressed sizes of vendored runtime wasm
Measured with `wc -c` on the raw file and `gzip -9 -c FILE | wc -c`. **Brotli not measured:** no `brotli` binary or Python module is installed, and installing one is out of scope.

| File (repo path) | Raw bytes | gzip -9 bytes | Ratio |
|---|---|---|---|
| EuchreGame `html/vendor/pyodide/pyodide.asm.wasm` (0.29.3) | 8,647,684 | 2,817,769 | 32.6% |
| p2p-ttt `vendor/sql.js/sql-wasm.wasm` | 659,806 | 321,893 | 48.8% |
| ai_chat_distil_01 `html/vendor/litertjs/core/wasm/litert_wasm_internal.wasm` | 8,414,718 | 2,558,774 | 30.4% |
| same dir `litert_wasm_compat_internal.wasm` | 8,380,350 | 2,548,610 | 30.4% |
| same dir `litert_wasm_threaded_internal.wasm` | 8,466,693 | 2,578,073 | 30.4% |
| EuchreGame `html/vendor/tasks-genai/wasm/genai_wasm_internal.wasm` | 26,254,636 | not measured | n/a |

- **ONNX Runtime Web 1.19.2 wasm: NOT MEASURED.** Downloads from jsDelivr and unpkg returned a policy block (403). Intended URLs: `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm-simd-threaded.wasm` and `.../ort-wasm-simd.wasm`. Filenames are from memory, so verify them.
- Pyodide 0.23.4 (the version rl-livive-net actually loads) was also not measured. The 0.29.3 figure is from the Euchre vendored copy.
- These are on-disk gzip levels. Real CDN or GitHub Pages transfer sizes depend on the server's encoding (GitHub Pages serves gzip, to my knowledge, and I did not check this). Treat them as estimates. The earlier "about 10 MB" figure is raw. Gzip transfer for the Pyodide wasm alone is about 2.8 MB, before `python_stdlib.zip`.

### 5. General claims: authoritative sources
Status of the claim itself; none of these pages could be fetched this round, so the URLs are canonical references I know of, not quoted text.
| Claim | Status | Canonical source (unfetched) |
|---|---|---|
| WASM has no direct DOM access (goes through JS) | unclear (well known, not re-read) | https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts |
| Runs sandboxed | unclear (well known, not re-read) | https://webassembly.org/docs/security/ |
| Node.js can run WASM | unclear (well known, not re-read) | https://nodejs.org/api/wasm.html |
| WebGPU vs WASM for ML inference | unclear | https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html |
| OPFS availability | unclear (repo p2p-ttt uses it) | https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system |
- Repo evidence for Node and WASM: EuchreGame runs the same Python engine under pytest (not WASM). Nothing in the repos shows Node running WASM.
- None of these pages has been read. Do not cite them as confirmed until someone reads them. The site's "WebGPU often faster" line still has no verified support.

### README corrections from Round 2
1. ai_chat_distil_01: backend is WASM (`accelerator: "wasm"`). Remove the "unconfirmed" label.
2. EuchreGame: say Pyodide 0.29.3.
3. rag-poc: config lives in `embeddingWorker.ts`. Keep the WASM claim marked "believed default" until the source check.

## Round 2b (unsandboxed follow-up, run by coordinator)

| Claim | Status | Evidence |
|---|---|---|
| rag-poc embeddings use the WASM backend by default (Transformers.js 3.0.2, browser) | **Confirmed** | `src/backends/onnx.js` @ tag 3.0.2: browser branch pushes `wasm` (and `webgpu` if available) to `supportedDevices` and sets `defaultDevices = ['wasm']` (line 106). `embeddingWorker.ts` passes no `device`, so WASM is used. https://raw.githubusercontent.com/huggingface/transformers.js/3.0.2/src/backends/onnx.js |
| ONNX Runtime Web 1.19.2 WASM size | **Measured** | `ort-wasm-simd-threaded.wasm`: 11,018,731 bytes raw, 2,911,583 gzip -9. https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort-wasm-simd-threaded.wasm |
| Pyodide 0.23.4 `pyodide.asm.wasm` size (rl-livive-net) | **Measured** | 8,971,931 bytes raw, 2,860,914 gzip -9. https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.asm.wasm |
| Brotli sizes | **Not measured** | No brotli binary installed; gzip -9 only. |
| General claims (MDN, webassembly.org, Node.js docs) | **Still unfetched** | See `docs/sources.md`. Cite only after reading. |

Note: gzip sizes are one `gzip -9` run on a single file, not what a CDN serves (usually brotli, so likely smaller). The raw `.wasm` is only part of each runtime's download (stdlib, JS glue and models add more). Which ORT wasm file loads depends on browser features; the simd-threaded build was the one measured.
