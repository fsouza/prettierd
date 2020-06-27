declare module "nanolru" {
  export = LRU;

  declare class LRU {
    constructor(options: { max: number; maxAge: number });

    get<K, V>(key: K): V | null;

    set<K, V>(key: K, value: V): void;
  }
}
