import { addExecArgv } from "worker-lib"

// This is only necessary because our test runner is not receiving
// the `-r esbuild-register` directly to the node CLI.
addExecArgv("-r", "esbuild-register")
