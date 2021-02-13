import core_d from "core_d";

export function main(cmd: string): void {
  if (
    cmd === "start" ||
    cmd === "stop" ||
    cmd === "restart" ||
    cmd === "status"
  ) {
    core_d[cmd]();
    return;
  }

  const fileName = cmd;
  let text = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => {
    text += chunk;
  });
  process.stdin.on("end", () => {
    core_d.invoke([fileName], text);
  });
}
