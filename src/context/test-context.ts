import { buildContext } from "./context.service.js";

const result = await buildContext("Angular TypeScript");

console.log(JSON.stringify(result, null, 2));
