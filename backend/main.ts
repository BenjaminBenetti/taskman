import { Application } from "@oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = { message: "Hello World" };
});

const port = 8000;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });