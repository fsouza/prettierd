declare module "nanolru" {
  export = LRU;

  declare class LRU {
    constructor(options: { max: number; maxAge: number });

    length: number;

    keys: string[];

    get<K, V>(key: K): V | undefined;

    set<K, V>(key: K, value: V): void;

    clear(): void;
  }
}
