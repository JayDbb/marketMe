import {
  task,
  wait
} from "../../../../chunk-LD4YIQ6R.mjs";
import "../../../../chunk-GWKRNY4C.mjs";
import {
  __name,
  init_esm
} from "../../../../chunk-UW7LKCID.mjs";

// src/trigger/example.ts
init_esm();
var helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  // 5 minutes
  run: /* @__PURE__ */ __name(async (payload) => {
    console.log("Hello from Trigger.dev!", payload.message);
    await wait.for({ seconds: 5 });
    return {
      message: `Processed: ${payload.message}`
    };
  }, "run")
});
export {
  helloWorldTask
};
//# sourceMappingURL=example.mjs.map
