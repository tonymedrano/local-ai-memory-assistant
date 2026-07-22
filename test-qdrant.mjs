const response = await fetch("http://127.0.0.1:6333");

console.log(response.status);
console.log(await response.text());