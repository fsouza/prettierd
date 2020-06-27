declare module "core_d" {
  export function start(): void;

  export function stop(): void;

  export function restart(): void;

  export function status(): void;

  export function invoke(_: string[], string): void;
}
