import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // These React-Compiler-era rules flag patterns this codebase uses deliberately:
    //  - set-state-in-effect: the standard "set loading, then fetch" effect
    //  - purity / refs: Date.now() and a ref read inside submit handlers passed to react-hook-form's handleSubmit
    // They stay visible as warnings so they can be revisited, but do not fail the build.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"]),
]);
