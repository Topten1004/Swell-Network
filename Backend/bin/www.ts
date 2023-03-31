import debug from "debug";

import { app, server } from "../app";
debug("backend:server");

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
  // await new Promise(resolve => app.listen({ port: port }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

/**
 * Get port from environment, store in Express and listen on provided port, on all network instances
 */
const port = normalizePort(process.env["PORT"] || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

// var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(port);
app.on("error", onError);
app.on("listening", onListening);

startApolloServer();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

export { server };
