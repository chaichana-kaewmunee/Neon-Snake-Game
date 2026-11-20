/**
 * PRNG (Pseudo-Random Number Generator)
 * Deterministic 32-bit Mulberry32 algorithm for reproducible game simulation and tests.
 */
export class PRNG {
  private seed: number;

  constructor(seed: number = 123456789) {
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random float in range [0, 1)
   */
  next(): number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6d2b79f5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in range [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Reset the generator with a specific seed
   */
  setSeed(seed: number): void {
    this.seed = seed;
  }
}
