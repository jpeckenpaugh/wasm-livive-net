# wasm-livive-net
WASM

https://wasm.livive.net/

## Plan

An overview of what WebAssembly (WASM) is, plus links to the projects in the [livive.net portfolio](https://beta.livive.net/) that use it, with context on why each chose WASM over Node.js or other in-browser options.

Supporting docs:
- [docs/editorial-recommendation.md](docs/editorial-recommendation.md): site structure, overview draft, comparison framework, tone.
- [docs/research-findings.md](docs/research-findings.md): per-repo verification of WASM claims.

> Rationales in the table below are **inferred**. No repo states why it chose WASM over Node.js, and none has a benchmark. Confirm with the author before publishing.

### Goals
1. Explain WASM clearly: what it is, what it isn't, and when to use it.
2. Link each WASM-using project with a "Why WASM here" explanation.
3. Compare WASM against alternatives (Node.js/server, plain JS, WebGL/WebGPU, Web Workers).

### Approach
- Static site (HTML, CSS, ES modules), no build step, hosted on GitHub Pages (`CNAME` present).
- Single page: hero, overview, why WASM, gallery, trade-offs, optional demo, footer.
- Style: TBD (match the dark card style of beta.livive.net, or something different).
- Optional: a small live demo. Only include it with a fair methodology, since a naive WASM-vs-JS timing can mislead.

### Core framing
Node.js is a server runtime, so the real question is client versus server. Node can also run WASM.

### Projects and WASM Approaches (verified against repos)
| Project | WASM route | Verified notes | Inferred rationale |
|---|---|---|---|
| Age of Mycology (`aom`) | Pygbag (Python 3.14 to WASM) | Not Pyodide. Bundle about 63 MB (down from about 143 MB), CI limit 75 MB | Keep Python game code, no JS rewrite, no server |
| EuchreGame | Pyodide (vendored, about 11 MB uncompressed) | Same `euchre_game` engine in browser and pytest. LLM is MediaPipe GenAI/LiteRT on WebGPU with a user-supplied Gemma model (not WebLLM; the repo README is stale) | One deterministic engine, no backend |
| Lokarta (`lk.livive.net`) | Pyodide 0.29.2 (CDN), IDBFS saves, xterm.js | Confirmed | Reuse Python logic client-side |
| LunarLander Policy Lab (`rl-livive-net`) | Pyodide 0.23.4 + ONNX Runtime Web 1.19.2 | ONNX on the WASM CPU provider only, no WebGPU. PyPyBox2D physics, 9 policies | Python physics and local inference, no JS port |
| P2P Tic-Tac-Toe (`p2p-ttt`) | sql.js (vendored, in a Web Worker) + OPFS | In-memory DB exported whole to an OPFS file. Not the SQLite OPFS VFS. No IndexedDB. WebRTC with manual QR/link signalling and no STUN | Real SQL with no backend |
| Northstar RAG POC (`rag-poc`) | Transformers.js 3.0.2 embeddings (WASM likely) | Generation uses WebLLM on WebGPU. HF models download at runtime | Private on-device RAG, no API cost |
| `ai_chat_distil_01` | LiteRT.js (vendored WASM builds) | A speech-reconstruction POC, not chat. WASM vs WebGPU backend unconfirmed | Small on-device model, no inference server |
| `vibe-tic-tac-toe` | None | Static HTML/CSS/JS and localStorage; the non-WASM control in the Tic-Tac-Toe Trilogy | Baseline for comparison |

### Recurring Themes
- Reuse existing Python/C code unchanged.
- Zero backend hosting: free static hosting, no ops. Caveat: runtimes load from CDNs and models download from Hugging Face, so "data stays on device" needs qualifying.
- Determinism and portability across browser and tests.
- Trade-offs: download size, cold start, no direct DOM access. WebGPU is often faster for heavy ML, but no repo supports this, so cite a source or soften it.
- WASM is often glue. Several projects use WebGPU for the heavy work and WASM only for the runtime (Euchre, rag-poc).

### Milestones
1. [x] Draft plan (this README).
2. [x] Editorial recommendation.
3. [x] Verify WASM claims against repos (mostly done; see research findings).
4. [ ] Close remaining gaps (see Next Steps).
5. [ ] Draft final copy.
6. [ ] Build the static site.
7. [ ] Optional live demo.
8. [ ] Deploy to GitHub Pages and cross-link from beta.livive.net.

### Next Steps
1. **Author input** (needed before copy is final):
   - Are the inferred "why WASM" rationales the real reasons?
   - Do you have any measured numbers (load times, inference speed)?
   - Visual style: match beta.livive.net or new?
   - Live demo: include or skip?
2. **Close research gaps** (rate limit cut these short):
   - `ai_chat_distil_01`: read the LiteRT compile options (WASM vs WebGPU).
   - `rag-poc`: confirm the Transformers.js v3 default backend.
   - EuchreGame: check the Pyodide version.
   - Measure transfer sizes (compressed) for Pyodide and the other runtimes.
   - Find an authoritative source for any WASM vs WebGPU or Node.js comparison claims.
3. **Apply corrections** from `docs/research-findings.md` to `docs/editorial-recommendation.md` (EuchreGame LLM stack, rag-poc mixed backend, `ai_chat_distil_01` description, soften unsupported claims).
4. **Consider** adding fast-ttt and `vibe-tic-tac-toe` as a "trilogy" contrast.
5. **Scaffold the site** (`index.html`, CSS, JS, project data in a JSON file) and write final copy.
6. **Deploy** and link from the beta.livive.net portfolio.

### Open Decisions
- Visual style.
- Live demo or not.
- Content source: hand-written, or generated from a project data JSON.
