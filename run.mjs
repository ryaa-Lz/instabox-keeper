import worker from "./worker.js";

const env = { ...process.env };
const res = await worker.fetch(new Request("https://keeper.local/?format=text"), env, {
  waitUntil() {},
});
const body = await res.text();
console.log(body);
if (!res.ok) process.exit(1);
