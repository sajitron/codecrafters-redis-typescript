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

const storage: Record<string, string> = {};

function getValue(data: string): string {
  const [, , cmd, , key, , value] = data.split("\r\n");
  if (cmd.toLowerCase() === "echo") {
    return parseResponse(key);
  } else if (cmd.toLowerCase() === "set") {
    storage[key] = value;
    return `+OK\r\n`;
  } else if (cmd.toLowerCase() === "get") {
    const value = storage[key];
    if (!value) {
      return "$-1\r\n";
    }
    return parseResponse(value);
  }
  return `+PONG\r\n`;
}

function parseResponse(value: string): string {
  return `$${value.length}\r\n${value}\r\n`;
}
