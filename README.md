# wasm-livive-net
WASM

https://wasm.livive.net/

## Preliminary Plan

An overview of what WebAssembly (WASM) is, plus links to the projects in the [livive.net portfolio](https://beta.livive.net/) that use it, with context on why each chose WASM over Node.js or other in-browser options.

> Status: draft. Items marked **(verify)** are inferred from portfolio metadata and need confirming against each repo.

### Goals
1. Explain WASM clearly: what it is, what it isn't, and when to use it.
2. Link each WASM-using project with a "Why WASM here" explanation.
3. Compare WASM against alternatives (Node.js/server, plain JS, WebGL/WebGPU, Web Workers).

### Approach
- Static site (HTML, CSS, ES modules), no build step, hosted on GitHub Pages (`CNAME` already present).
- Style: TBD (match the dark card style of beta.livive.net, or something different).
- Optional: a small live demo (hand-written WASM module vs JS timing comparison).

### Site Sections
1. **Overview.** Portable binary format, sandboxed, near-native speed, compile target for C/C++/Rust/Python and others. Limits: no direct DOM access, needs JS glue, larger downloads, slower cold start.
2. **WASM vs. alternatives.** Node.js is a server runtime, so the real question is client versus server. Node can also run WASM. Also compared: plain JS, WebGL/WebGPU, Web Workers.
3. **Project gallery.** Cards with live link, repo link, WASM approach and rationale.
4. **(Optional) Live demo.**

### Projects and WASM Approaches
| Project | WASM route | Why WASM (vs. Node.js / alternatives) |
|---|---|---|
| Age of Mycology (`aom`) | Pygbag (Python to WASM) | Keeps the Python game code, no JS rewrite, no server |
| EuchreGame | Pyodide (+ WebLLM) | Same deterministic Python engine in browser and tests, no backend latency or cost |
| Lokarta (`lk.livive.net`) | Pyodide **(verify)** | Reuse Python logic client-side |
| LunarLander Policy Lab (`rl-livive-net`) | Pyodide + ONNX Runtime Web | Python physics plus local RL policy inference, no porting to JS |
| P2P Tic-Tac-Toe (`p2p-ttt`) | sql.js (SQLite to WASM) + OPFS | Real SQL with no backend; IndexedDB has no query engine |
| Northstar RAG POC (`rag-poc`) | Transformers.js (ONNX on WASM) **(verify)** | Private, on-device RAG with no API cost |
| `ai_chat_distil_01` | LiteRT.js (TFLite) | On-device small model, no inference server |

### Recurring Themes
- Reuse existing Python/C code unchanged.
- Zero backend: free static hosting, no ops, data stays on device.
- Determinism and portability across browser and tests.
- Trade-offs: download size (e.g. Pyodide ~10 MB), cold start, WebGPU often faster for heavy ML.

### Milestones
1. Verify each project's WASM usage against its repo.
2. Draft the content (overview, comparison, per-project blurbs).
3. Build the static site: layout, sections, project cards.
4. Add the optional live demo.
5. Deploy to GitHub Pages and cross-link from beta.livive.net.

### Open Decisions
- Visual style.
- Include the live demo or not.
- Content source: hand-written, or generated from the portfolio's JSON.
