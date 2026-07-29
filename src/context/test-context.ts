import { buildContext } from "./context.service.js";

const result = await buildContext("¿Cuál es la arquitectura del memory-service?");

console.log(JSON.stringify(result, null, 2));
