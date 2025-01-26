export function calcCrc(buffer: number[]): number {
    let result = 0;

    buffer.forEach((v: number) => result ^= v);

    result ^= 254;

    return result;
}

export function calcCrcBuffer(buffer: Buffer): number {
  let result = 0;

  buffer.forEach((v: number) => result ^= v);

  result ^= 254;

  return result;
}

export function toPayload(numbers: number[]): number[] {
  return [...numbers, calcCrc(numbers)];
}
