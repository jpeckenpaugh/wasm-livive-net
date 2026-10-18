# Editorial Recommendation (Preliminary)

Based on README.md only. I did not check the repos. Claims marked **(verify)** are unconfirmed.

## 1. Site structure

Use a single scrolling page with anchored sections. The site is small, and one page keeps the argument in order.

| # | Section | Purpose |
|---|---|---|
| 0 | Header/hero | One sentence: "What WebAssembly is, and where I've used it." Links to the gallery and to beta.livive.net. |
| 1 | Overview | Define WASM and say what it isn't. Readable in under 90 seconds. |
| 2 | Why WASM (vs. alternatives) | A decision framework, not a ranking. Covers client vs. server first, then JS, Workers, WebGL/WebGPU. |
| 3 | Project gallery | Seven cards. They are the evidence for the claims in section 2. |
| 4 | Trade-offs I hit | Short, honest list: payload size, cold start, debugging, JS glue. Pulled from real projects. |
| 5 | (Optional) Live demo | Include it only if it is honest. See open questions. |
| 6 | Footer | Repo links, contact, "last verified" date. |

I'd put the trade-offs in their own section (4). The README folds them into the overview, but hiring managers tend to trust a page more when it names costs separately.

## 2. Draft overview (about 190 words)

> **WebAssembly (WASM)** is a compact binary instruction format that browsers, and some server runtimes, can run in a sandbox at close to native speed. You rarely write it by hand. You compile to it from languages such as C, C++, Rust, or, through runtimes like Pyodide, Python.
>
> What it gives you: code you already have can run in the browser unchanged. It behaves the same across platforms, and it runs inside the browser's security sandbox.
>
> What it isn't: it is not a JavaScript replacement. It can't touch the DOM directly, so it needs JavaScript glue code. It isn't always faster. For small tasks, the cost of crossing the JS/WASM boundary and loading the module can outweigh the gain. It isn't free to ship either. Python runtimes like Pyodide add roughly 10 MB **(verify current size)**, and cold starts are noticeable. It isn't a server framework. It is a compile target, and it runs in many places, including Node.js.
>
> The projects below use WASM mainly to keep existing logic, run with no backend, and keep data on the user's device. Each one also lists what that choice cost.

## 3. "Why WASM vs. Node.js / others" framework

**Lead with the reframe.** Node.js is a server runtime and WASM is a code format, so they aren't direct competitors. The real question is **where the code runs: on the client or on a server.** Node can also run WASM, so the two can be combined.

Structure the section as a decision sequence:

1. **Where should this run?**
   - Server: needs shared state, secrets, heavy or persistent compute, or a central database. Use Node (or any backend). WASM is optional there.
   - Client: needs no backend, no per-request cost, offline use, or data staying on the device. Continue to question 2.
2. **Do you already have the logic in Python/C/Rust?**
   - Yes: WASM avoids a rewrite. This is the most common reason in these projects.
   - No: plain JS/TS is usually simpler and smaller.
3. **Is the work CPU-bound, and would it block the UI?**
   - Move it to a Web Worker. Workers are orthogonal to WASM, and the two are often used together.
4. **Is the work highly parallel (graphics, large ML)?**
   - WebGL/WebGPU is often faster than WASM for this **(verify per project, with measurements if available)**.
5. **Do you need a query engine, a determinism guarantee, or a library that only exists natively?**
   - WASM (for example sql.js) is a strong fit.

Present it as a compact table, with rows for Node/server, plain JS, Web Workers, WebGL/WebGPU, and WASM. Columns: runs where, best for, cost, "used in my projects?".

Be explicit about the downsides. The server route costs hosting, latency, and ops. The client WASM route costs payload size, cold start, and harder debugging.

## 4. Per-project blurb template

Keep each card to about 60-90 words. Fields:

```
### <Project name>
Live: <url> · Repo: <url>
**WASM route:** <tool, e.g. Pyodide / Pygbag / sql.js>
**What it does:** <one sentence, user-visible>
**Why WASM here:** <the concrete reason: reuse, no backend, privacy, determinism>
**Alternative considered:** <what else was possible and why not>
**Cost:** <size, startup, or complexity trade-off, with a number if measured>
**Status:** <verified against repo on YYYY-MM-DD / unverified>
```

**Worked example (EuchreGame, details unverified)**

> ### EuchreGame
> Live: *(url)* · Repo: *(url)*
> **WASM route:** Pyodide (plus WebLLM for the AI opponent chat **(verify)**)
> **What it does:** A playable Euchre card game that runs entirely in the browser.
> **Why WASM here:** The game engine is written in Python and is deterministic. Running that same engine in the browser and in the test suite means the tests cover what players actually run. **(verify that the tests import the same engine module)**
> **Alternative considered:** A Python backend (adds latency and hosting cost), or a JS rewrite (two engines to keep in sync).
> **Cost:** Pyodide adds a download of roughly 10 MB and a few seconds of cold start **(measure)**.
> **Status:** Unverified.

## 5. Tone and style

- State what the code does, then what it cost. Never describe WASM as "blazing fast" without a measurement.
- Say "near-native" or "often faster", never "faster". Say "in my case" for anything that is a project-specific finding.
- Use concrete numbers (MB, ms) or leave them out. Never use vague superlatives.
- First person for decisions ("I chose Pyodide because..."). Third person for definitions.
- Short sentences, with each term defined on first use. Assume a developer, not a WASM specialist.
- Admit when WASM wasn't the best option, for example WebGPU for heavy ML. That honesty is the main selling point.
- Avoid claiming "no backend" projects have no network use. Model downloads and WebRTC signalling count as network use.

## 6. Claims to verify against repos

| Claim (from README) | Check |
|---|---|
| Lokarta uses Pyodide | Already flagged in README. Confirm in the repo. |
| Northstar RAG uses Transformers.js on the WASM backend | Already flagged. It may use WebGPU or another backend. Check the config. |
| Age of Mycology uses Pygbag | Confirm the build output and that the Python code is unchanged. |
| EuchreGame: same engine in browser and tests | Check shared module and test imports. |
| EuchreGame uses WebLLM | WebLLM normally runs on WebGPU, not WASM. Be precise about which part is WASM. |
| LunarLander: Pyodide plus ONNX Runtime Web | Check which execution provider (wasm vs. webgpu) runs inference. |
| p2p-ttt: sql.js plus OPFS | Check that persistence really uses OPFS and not IndexedDB. Check how peer connection works (signalling server?). |
| `ai_chat_distil_01`: LiteRT.js | Confirm the backend (WASM vs. WebGPU). |
| "No backend" / "data stays on device" for every project | Check for any API calls, CDN-hosted models, or analytics. |
| Pyodide is about 10 MB | Check the version used and the actual transferred size. |
| "WebGPU often faster for heavy ML" | General claim. Cite a source or a benchmark, or soften it. |
| "No JS rewrite" claims | Check that no significant JS logic was added. |
| Rationale for each choice | These are inferred from metadata, not from the author's own statement. The author must confirm that they match the actual reasons. |

## 7. Open questions for the author

1. Are the "why WASM" rationales the real historical reasons, or after-the-fact justifications? The page should say which.
2. Did you measure anything (load time, bundle size, inference speed, WASM vs. JS)? Real numbers would help the page a lot.
3. Did any project start on Node or JS and move to WASM, or the reverse? Such a story would be the strongest content.
4. Main audience: hiring managers or developers learning WASM? That changes how deep the overview goes.
5. Live demo: include it? If yes, a hand-written WASM vs. JS timing test is easy to get wrong (JIT warm-up, boundary cost). Is it worth the effort and the risk of a misleading result?
6. Visual style: match beta.livive.net, or differentiate?
7. Content source: hand-written, or generated from the portfolio JSON? I recommend hand-written prose, with only the links and metadata pulled from JSON.
8. Are there any WASM projects not listed? Are any listed projects not really WASM-dependent?
9. Should the page cover where WASM did not fit (projects where you chose JS instead)?
10. Are the repos public, and are repo links fine to publish on this page?
