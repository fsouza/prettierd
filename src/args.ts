interface Command {
  command: string;
  description: string;
}

const commands: Command[] = [
  {
    command: '--help',
    description: 'Show CLI usage.',
  },
  {
    command: '--version\t',
    description: 'Print prettierd version.',
  },
  {
    command: '--ignore-path <path>',
    description: 'Path to a file with patterns describing files to ignore.',
  },
  {
    command: '--no-color\t',
    description: 'Do not colorize error messages.',
  },
  {
    command: 'start\t\t',
    description: 'Start the prettierd.',
  },
  {
    command: 'stop\t\t',
    description: 'Stop the prettierd.',
  },
  {
    command: 'restart\t',
    description: 'Restart the prettierd.',
  },
  {
    command: 'status\t\t',
    description: 'Get the prettierd status.',
  },
  {
    command: 'invoke\t\t',
    description: 'Invoke the prettierd.',
  },
];

export function displayHelp() {
  for (let i = 0, length = commands.length; i < length; i++) {
    console.log(` ${commands[i].command}\t${commands[i].description}\n`);
  }
}
