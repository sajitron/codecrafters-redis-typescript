import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  connection.on("data", (data) => {
    const value = getValue(data.toString());
    connection.write(value);
  });
});
//
server.listen(6379, "127.0.0.1");

function getValue(data: string): string {
  const [, , key, , arg] = data.split("\r\n");
  if (key === "ECHO") {
    return `$${arg.length}\r\n${arg}\r\n`;
  }
  return `+PONG\r\n`;
}
