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
const configStorage: Record<string, string> = {};

function getValue(data: string): string {
  const dataList = data.split("\r\n");
  const cmd = dataList[2];
  const key = dataList[4];
  const value = dataList[6];
  const expiry = dataList[10];

  const defaultResponse = `+PONG\r\n`;
  const emptyResponse = "$-1\r\n";
  const args = process.argv;

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      configStorage[args[i].replace("--", "")] = args[i + 1];
    }
  }

  switch (cmd.toLowerCase()) {
    case "echo":
      return parseResponse(key);
    case "set":
      storage[key] = { value, expiry: expiry ?? "0", timestamp: Date.now() };
      return `+OK\r\n`;
    case "get":
      const storageValue = storage[key];
      if (!storageValue || isExpired(storageValue)) {
        return emptyResponse;
      }
      return parseResponse(storageValue.value);
    case "config":
      if (key.toLowerCase() === "get") {
        const config = configStorage[value];
        return config ? convertToRespArray([value, config]) : emptyResponse;
      }
      return defaultResponse;
    default:
      return defaultResponse;
  }
}

function parseResponse(value: string): string {
  return `$${value.length}\r\n${value}\r\n`;
}

function convertToRespArray(args: string[]): string {
  return `*${args.length}\r\n$${args[0].length}\r\n${args[0]}\r\n$${args[1].length}\r\n${args[1]}\r\n`;
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
