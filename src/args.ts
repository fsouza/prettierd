interface Command {
  command: string;
  description: string;
}

/**
 * Note: today this is an array that is only used to display the help menu,
 * but the plan is to improve later to be an array where commands will be defined.
 *
 * TODO: improve the way of displaying the help menu so that no longer need all the "\t's"
 * (as today it just strings the (\t) is used to keep all descriptions aligned.)
 */
const commands: Command[] = [
  {
    command: "--help",
    description: "Show CLI usage.",
  },
  {
    command: "--version\t",
    description: "Print prettierd version.",
  },
  {
    command: "--ignore-path <path>",
    description: "Path to a file with patterns describing files to ignore.",
  },
  {
    command: "--no-color\t",
    description: "Do not colorize error messages.",
  },
  {
    command: "start\t\t",
    description: "Start the prettierd.",
  },
  {
    command: "stop\t\t",
    description: "Stop the prettierd.",
  },
  {
    command: "restart\t",
    description: "Restart the prettierd.",
  },
  {
    command: "status\t\t",
    description: "Get the prettierd status.",
  },
  {
    command: "invoke\t\t",
    description: "Invoke the prettierd.",
  },
];

export function displayHelp() {
  for (let i = 0, length = commands.length; i < length; i++) {
    console.log(` ${commands[i].command}\t${commands[i].description}\n`);
  }
}
