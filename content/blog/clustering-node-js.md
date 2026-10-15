---
title: Clustering NodeJS for Performance
description: Take advantage of multiple CPUs by clustering your Node app
date: 2020-10-02T19:19:08.514Z
---

NodeJS is single-threaded by default. If you're running an app on a server with more than 1 CPU, you could easily increase performance by clustering your app via workers. 

It's really easy to get started:

```js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

This is a simple example from the [Nodejs Docs](https://nodejs.org/api/cluster.html).

You can easily replace `http.createServer` with an express or hapi app as well!
