# Editorial Recommendation (Revised)

Sources: README.md, docs/research-findings.md (incl. Round 2 and 2b), docs/sources.md.
Status key: **confirmed** = read in a repo or library source. **inferred** = reasoning, not stated by the author. **unverified** = general claim whose source page has not been read.

## 1. Site structure

A single scrolling page with anchored sections.

| # | Section | Purpose |
|---|---|---|
| 0 | Header/hero | One sentence: "What WebAssembly is, and where I've used it." Links to the gallery and beta.livive.net. |
| 1 | Overview | Define WASM and say what it isn't. Readable in about 90 seconds. |
| 2 | Why WASM (vs. alternatives) | A decision framework, not a ranking. Client vs. server first, then JS, Workers, WebGL/WebGPU. |
| 3 | Project gallery | Seven WASM cards plus one non-WASM control. The evidence for section 2. |
| 4 | Trade-offs I hit | Measured sizes (with method), cold start, JS glue, WASM-as-runtime-glue. |
| 5 | (Optional) Live demo | Only with a fair methodology (warm-up, boundary cost). |
| 6 | Footer | Repo links, contact, "last verified" date. |

**Trilogy contrast (optional):** show `vibe-tic-tac-toe` (no WASM, static HTML/CSS/JS plus localStorage) beside `p2p-ttt` (sql.js, OPFS, WebRTC), and `fast-ttt` if it fits. Use it as the "when you don't need WASM" example. `fast-ttt` has not been researched.

## 2. Draft overview (about 200 words)

> **WebAssembly (WASM)** is a compact binary instruction format that browsers, and some server runtimes, can run in a sandbox. You rarely write it by hand. You compile to it from languages such as C, C++, Rust, or, through runtimes like Pyodide and Pygbag, Python.
>
> What it gives you: code you already have can run in the browser without a rewrite, and the browser's sandbox contains it.
>
> What it isn't: it is not a JavaScript replacement. It can't touch the DOM directly, so it needs JavaScript glue. It isn't automatically faster. It isn't free to ship: Python runtimes add several megabytes of WASM plus a standard library, and cold starts are noticeable (measured sizes are in the trade-offs section). It isn't a server framework. It is a compile target, and Node.js can run it too.
>
> In my projects, WASM is often the runtime that carries existing Python or a small model, not the part doing the heaviest compute. Some of the heavy work, such as LLM generation, runs on WebGPU instead. Each project card says which parts are WASM and what the choice cost.

*Unverified general claims in this draft: no direct DOM access, sandboxing, Node.js runs WASM. Source pages are listed in docs/sources.md and have not been read. Confirm before publishing.*

## 3. "Why WASM vs. Node.js / others" framework

**Lead with the reframe.** Node.js is a server runtime and WASM is a code format, so they aren't direct competitors. The real question is **where the code runs: client or server.** Node can also run WASM *(unverified; nodejs.org/api/wasm.html not read)*, so the two can be combined.

Decision sequence:

1. **Where should this run?**
   - Server: needs shared state, secrets, persistent or heavy compute, or a central database. Use Node or another backend.
   - Client: wants no backend hosting, no per-request cost, or offline use. Go to question 2.
2. **Do you already have the logic in Python/C/Rust?**
   - Yes: WASM avoids a rewrite. In the repos this is the likeliest reason for AoM, EuchreGame, Lokarta and rl-livive-net. It is **inferred**, since no repo states a rationale.
   - No: plain JS/TS is usually simpler and smaller (see the `vibe-tic-tac-toe` control).
3. **Is the work CPU-bound and does it block the UI?** Use a Web Worker. Workers are orthogonal to WASM. p2p-ttt runs sql.js in a Worker (confirmed).
4. **Is the work highly parallel (graphics, large ML)?** WebGL/WebGPU may be a better fit than WASM. No repo benchmarks this, and the ONNX Runtime WebGPU docs have not been read, so say "may" and cite a source if the claim stays. Two projects already use WebGPU for the LLM (EuchreGame, rag-poc).
5. **Do you need a query engine or a native-only library in the browser?** WASM is a strong fit (sql.js in p2p-ttt).

Present it as a table: rows for Node/server, plain JS, Web Workers, WebGL/WebGPU, WASM. Columns: runs where, best for, cost, "used in my projects?".

State the costs. Server: hosting, latency, ops. Client WASM: payload size, cold start, harder debugging.

## 4. Per-project blurbs

### Template (60-90 words)

```
### <Project name>
Live: <url> · Repo: <url>
**WASM route:** <tool and version>
**What it does:** <one sentence, user-visible>
**What is WASM, what isn't:** <which parts run on WASM, which on WebGPU/JS>
**Why WASM here (inferred):** <reason; mark inferred until the author confirms>
**Alternative considered (inferred):** <what else, and why not>
**Cost:** <measured size with method, startup>
**Network note:** <what loads from CDNs or is downloaded at runtime>
```

### Worked example: EuchreGame (repo-verified; rationale inferred)

> ### EuchreGame
> Live: *(url)* · Repo: https://github.com/jpeckenpaugh/EuchreGame
> **WASM route:** Pyodide 0.29.3, vendored in the repo.
> **What it does:** A playable Euchre game in the browser, with an optional on-device LLM opponent.
> **What is WASM, what isn't:** The game engine runs on Pyodide. The LLM uses MediaPipe GenAI (LiteRT) with a user-supplied Gemma model on WebGPU. The 26 MB `genai_wasm_internal.wasm` is runtime glue. It is not WebLLM; the repo README is stale on this.
> **Why WASM here (inferred):** The same `euchre_game` Python engine is imported by the browser bridge (`game_bridge.py`) and by `tests/test_game.py`, so tests cover the code players run. This is confirmed. That it was the reason for choosing WASM is inferred.
> **Alternative considered (inferred):** A Python backend (latency, hosting) or a JS rewrite (two engines).
> **Cost:** `pyodide.asm.wasm` is 8,647,684 bytes raw (2,817,769 gzip -9); with `python_stdlib.zip` (2.42 MB) the runtime is about 11 MB uncompressed.
> **Network note:** Pyodide is vendored, so no CDN fetch. The Gemma model file is supplied by the user.

### Per-project facts (confirmed in repos unless marked)

| Project | WASM route | Confirmed notes | Rationale |
|---|---|---|---|
| Age of Mycology (`aom`) | Pygbag 0.9.3, Python 3.14, built in CI | **Pygbag is not Pyodide.** Bundle `aom.tar.gz` about 63 MB with the atlas profile (down from about 143 MB); CI fails above 75 MB. Tests and raw assets are in a private repo. | Inferred: keep Python game code. No repo states one. |
| EuchreGame | Pyodide 0.29.3 (vendored) | See the worked example. | Inferred |
| Lokarta (`lk.livive.net`) | Pyodide 0.29.2 from jsDelivr, xterm.js, IDBFS saves | Confirmed. The repo README only describes a local terminal POC. | Inferred |
| LunarLander Policy Lab (`rl-livive-net`) | Pyodide 0.23.4 + ONNX Runtime Web 1.19.2, both from CDN | ORT uses `executionProviders:["wasm"]`, **WASM CPU only, no WebGPU**. PyPyBox2D (pure Python) physics via micropip. 9 ONNX policies. | Inferred |
| P2P Tic-Tac-Toe (`p2p-ttt`) | sql.js (vendored, Web Worker) + OPFS | sql.js runs in memory; `db.export()` rewrites the **whole** `game.db` to OPFS on each persist (not the SQLite OPFS VFS). IndexedDB is not used. WebRTC has no STUN/TURN; signalling is **manual** (SDP in `#z` links or QR codes). No signalling server. | Inferred: "IndexedDB has no query engine" is the README's reasoning, not the repo's. |
| Northstar RAG POC (`rag-poc`) | Transformers.js 3.0.2 embeddings on WASM, WebLLM on WebGPU | Mixed backend. Embedding WASM default confirmed at tag 3.0.2 (`defaultDevices = ['wasm']`; no `device` passed). Llama-3.2-1B (about 880 MB) on WebGPU, with retrieval-only fallback. HF models download at runtime. | Inferred |
| `ai_chat_distil_01` | LiteRT.js, `accelerator: "wasm"` | **A speech-reconstruction POC ("Closed-System Speech POC"), not a chat model.** Small TFLite models reconstruct "hello"/"goodbye" waveforms. | Inferred |
| `vibe-tic-tac-toe` (control) | None | Static HTML/CSS/JS and localStorage. The non-WASM baseline in the Tic-Tac-Toe Trilogy. | n/a |

## 4b. Measured sizes (use these, not a single figure)

Method: raw size from `wc -c`; compressed size from one `gzip -9` run on the single `.wasm` file. Brotli not measured. Real CDN or GitHub Pages transfer will differ (CDNs often use brotli, likely smaller; GitHub Pages encoding not checked). The `.wasm` is only part of each download; stdlib, JS glue and models add more.

| File | Raw bytes | gzip -9 bytes |
|---|---|---|
| Pyodide 0.29.3 `pyodide.asm.wasm` (EuchreGame, vendored) | 8,647,684 | 2,817,769 |
| Pyodide 0.23.4 `pyodide.asm.wasm` (rl-livive-net, jsDelivr) | 8,971,931 | 2,860,914 |
| ONNX Runtime Web 1.19.2 `ort-wasm-simd-threaded.wasm` (jsDelivr) | 11,018,731 | 2,911,583 |
| LiteRT.js `litert_wasm_internal.wasm` (`ai_chat_distil_01`) | 8,414,718 | 2,558,774 |
| sql.js `sql-wasm.wasm` (p2p-ttt) | 659,806 | 321,893 |
| MediaPipe GenAI `genai_wasm_internal.wasm` (EuchreGame) | 26,254,636 | not measured |
| AoM `aom.tar.gz` bundle (Pygbag, atlas profile) | about 63 MB (down from about 143 MB) | n/a (already an archive) |

Caveats to print on the page: the ORT file measured is the simd-threaded build, and which file loads depends on the browser. No transfer sizes, load times or cold-start timings were measured. Do not quote a single "~10 MB" figure.

## 5. Tone and style

- State what the code does, then what it cost. No "blazing fast" without a measurement.
- Say "near-native" or "often faster" only with a cited source, otherwise say nothing about speed.
- Use concrete numbers with the method, or leave them out.
- First person for decisions, third person for definitions. Label any rationale **inferred** until the author confirms.
- Short sentences. Define each term on first use. Assume a developer, not a WASM specialist.
- Admit where WASM isn't the heavy lifter (WebGPU in Euchre and rag-poc) or isn't needed (the `vibe-tic-tac-toe` control).
- "No backend" means no backend hosting. Do not write "data stays on device" without the caveat: runtimes load from CDNs (Pyodide in Lokarta and rl-livive-net; ONNX Runtime) and rag-poc downloads Hugging Face models at runtime. Say "inference and game state run locally" where that is accurate.

## 6. Claims to verify

| Claim | Status | Source |
|---|---|---|
| AoM uses Pygbag, not Pyodide | **Confirmed** | aom CI workflow and README (`pygbag==0.9.3`) |
| AoM bundle about 63 MB, down from about 143 MB; CI ceiling 75 MB | **Confirmed** (from repo; not rebuilt) | aom README / `pages.yml` |
| EuchreGame uses Pyodide | **Confirmed**, 0.29.3 | `html/vendor/pyodide/package.json` |
| EuchreGame: same engine in browser and tests | **Confirmed** | `game_bridge.py`, `tests/test_game.py`, deploy workflow |
| EuchreGame uses WebLLM | **Refuted** (MediaPipe GenAI/LiteRT, WebGPU) | `main.js`, `html/vendor/model-libs/README.md` |
| Lokarta uses Pyodide | **Confirmed**, 0.29.2 CDN | `docs/main.js`, `TODO_Pyodide.md` |
| rl-livive-net: Pyodide 0.23.4, ORT Web 1.19.2 | **Confirmed** | `index.html`, `src/models.js` |
| rl-livive-net uses WebGPU | **Refuted** (WASM CPU only) | `src/models.js` |
| p2p-ttt uses sql.js and OPFS | **Confirmed** | `js/db/persistence.js` |
| p2p-ttt uses IndexedDB | **Refuted** | `js/db/persistence.js` |
| p2p-ttt: WebRTC with no STUN, manual QR/link signalling | **Confirmed** | `new RTCPeerConnection()` with no config; `docs/architecture.md` |
| p2p-ttt connections across NATs may fail without STUN | **Unclear** (inference, untested) | n/a |
| "IndexedDB has no query engine" as the reason for sql.js | **Unclear** (README inference only) | n/a |
| rag-poc embeddings run on WASM | **Confirmed** | `embeddingWorker.ts` (no `device`); transformers.js `src/backends/onnx.js` @ 3.0.2 |
| rag-poc generation uses WebLLM on WebGPU | **Confirmed** | rag-poc code (research-findings) |
| rag-poc vector search under 2 ms over 367 chunks | **Unclear** (README claim, not a WASM benchmark) | rag-poc README |
| `ai_chat_distil_01` uses LiteRT.js with the WASM backend | **Confirmed** | `html/tflite_demo.html` L142-143 |
| `ai_chat_distil_01` is a chat model | **Refuted** (speech POC) | repo README |
| `vibe-tic-tac-toe` has no WASM | **Confirmed** | `index.html` loads only `script.js` |
| Measured WASM sizes (section 4b) | **Confirmed (measured)**, gzip -9 only | research-findings Round 2 and 2b |
| Transfer size or load time for any runtime | **Unclear** (not measured) | n/a |
| "WebGPU is often faster than WASM for heavy ML" | **Unverified** (no repo benchmark; source not read) | https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html |
| "Data stays on device" | **Partly refuted**: needs caveats (CDN runtimes, HF downloads) | research-findings cross-cutting |
| WASM has no direct DOM access | **Unverified** (source not read) | https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts |
| WASM runs sandboxed | **Unverified** (source not read) | https://webassembly.org/docs/security/ |
| Node.js can run WASM | **Unverified** (source not read; no repo shows it) | https://nodejs.org/api/wasm.html |
| OPFS browser support | **Unverified** (source not read) | MDN OPFS page (docs/sources.md) |
| Every "why WASM" rationale | **Inferred**, no repo states one | research-findings cross-cutting |

## 7. Open questions for the author

1. Are the inferred "why WASM" rationales the real historical reasons? The page should say which are confirmed by you.
2. Have you measured anything (load time, transfer size, inference speed, WASM vs. JS or WebGPU)? Real numbers would help most.
3. Did any project move from Node/JS to WASM, or the reverse? That story would be strong content.
4. Main audience: hiring managers or developers learning WASM?
5. Live demo: include it? A fair WASM-vs-JS timing needs warm-up and boundary-cost handling.
6. Visual style: match beta.livive.net, or differentiate?
7. Content source: hand-written prose with links and metadata from a JSON file (my recommendation), or fully generated?
8. Should the page include the `vibe-tic-tac-toe` control and `fast-ttt` as a trilogy?
9. Should the stale READMEs (EuchreGame says WebLLM; Lokarta describes only a local POC) be fixed in the repos before the site links to them?
10. Are all repos public, and is it fine to link them? (AoM tests and assets are in a private repo.)
11. Is `ai_chat_distil_01` presented as "speech POC" acceptable, and does it belong in a WASM showcase?

## Changelog

Revision 2 (applies research-findings.md Rounds 1, 2 and 2b):

- **Projects:** EuchreGame now says Pyodide 0.29.3 with MediaPipe GenAI/LiteRT on WebGPU, not WebLLM. rl-livive-net is ORT Web on WASM CPU only. p2p-ttt documents OPFS whole-DB export and manual QR signalling with no STUN. rag-poc is WASM embeddings plus WebLLM on WebGPU. `ai_chat_distil_01` is a speech POC with accelerator `"wasm"`. AoM has bundle sizes and "Pygbag is not Pyodide". `vibe-tic-tac-toe` added as the non-WASM control. Lokarta's "(verify)" removed.
- **Sizes:** removed the "~10 MB" figure. Added section 4b with measured raw and gzip -9 sizes, method and caveats.
- **Blurb template:** added "What is WASM, what isn't", "Network note", and inferred labels. Worked example replaced with repo-verified EuchreGame facts.
- **Claims table:** each claim is now confirmed, refuted, unclear, unverified or inferred, with a source. MDN, webassembly.org and Node.js claims stay unverified until fetched.
- **Softened:** "WebGPU often faster" is now "may", with a source needed. "Data stays on device" is now caveated. "Near-native" and "faster" need a cited source. Overview rewritten to drop the speed claim and the ~10 MB figure.
- **Structure:** trade-offs section now carries measured sizes. Added the optional trilogy contrast. Added open questions 8-11.
