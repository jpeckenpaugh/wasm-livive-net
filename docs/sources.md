# Sources

Status key: **read** = content inspected this research; **unfetched** = canonical URL, blocked or denied in the sandbox, not read.

## Repos (read, shallow clones in scratch/)
- https://github.com/jpeckenpaugh/ai_chat_distil_01: `html/tflite_demo.html` uses LiteRT.js with `accelerator: "wasm"` (L143). **read**
- https://github.com/jpeckenpaugh/rag-poc: `src/workers/embeddingWorker.ts` configures Transformers.js 3.0.2 with no device. **read**
- https://github.com/jpeckenpaugh/EuchreGame: vendored Pyodide 0.29.3 (`html/vendor/pyodide/package.json`). **read**
- https://github.com/jpeckenpaugh/p2p-ttt: vendored `sql-wasm.wasm`, 659,806 bytes. **read**

## General references
- https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts: MDN WebAssembly concepts (JS interop, no DOM). **unfetched**
- https://webassembly.org/docs/security/: WebAssembly sandbox and security model. **unfetched**
- https://nodejs.org/api/wasm.html: Node.js WebAssembly documentation. **unfetched**
- https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system: MDN OPFS reference and support. **unfetched**
- https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html: ONNX Runtime Web WebGPU execution provider. **unfetched**
- https://huggingface.co/docs/transformers.js/guides/webgpu: Transformers.js WebGPU guide, `device` option. **unfetched**
- https://github.com/huggingface/transformers.js (tag 3.0.2, `src/utils/devices.js`, `src/backends/onnx.js`): library source to check the default device. **unfetched**
- https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/: ORT Web 1.19.2 wasm files to measure. **blocked (403)**
