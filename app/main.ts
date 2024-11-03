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

interface StorageValue {
  value: string;
  timestamp: number;
  expiry: string;
}

const storage: Record<string, StorageValue> = {};

function getValue(data: string): string {
  const [, , cmd, , key, , value, , , , expiry] = data.split("\r\n");
  if (cmd.toLowerCase() === "echo") {
    return parseResponse(key);
  } else if (cmd.toLowerCase() === "set") {
    storage[key] = { value, expiry: expiry ?? "0", timestamp: Date.now() };
    return `+OK\r\n`;
  } else if (cmd.toLowerCase() === "get") {
    const storageValue = storage[key];
    if (!storageValue || isExpired(storageValue)) {
      return "$-1\r\n";
    }

    return parseResponse(storageValue.value);
  }
  return `+PONG\r\n`;
}

function parseResponse(value: string): string {
  return `$${value.length}\r\n${value}\r\n`;
}

function isExpired(storeValue: StorageValue): boolean {
  if (storeValue.expiry === "0") {
    return false;
  }
  const currentTime = Date.now();
  const expiryTime = parseInt(storeValue.expiry);
  if (currentTime - storeValue.timestamp > expiryTime) {
    return true;
  }
  return false;
}
