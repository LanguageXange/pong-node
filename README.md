# Pong Game with Socket.io & Express

Multiplayer pong game with namespaces and rooms

## Setting Up Socket.IO Server

`pnpm init`

`pnpm add socket.io`

update index.html to include socket.io client script

we can remove computerAI related function in our `script.js`

## Using Socket.io with Express

`pnpm add express`

```
// api.js
const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("index.html"));

```

### Change to ES Modules syntax

https://socket.io/docs/v3/server-initialization/#es-modules

### Notes

- We will see the error:
  `ReferenceError: __dirname is not defined in ES module scope` when we write this
  `app.use(express.static(path.join(__dirname, "public")));`

- Solution: https://github.com/nodejs/help/issues/2907#issuecomment-757446568

```
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

```

## To play

`pnpm start`
