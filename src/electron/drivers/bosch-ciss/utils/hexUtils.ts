export function stringToHexA(input: string): number[] {
  let result: number[] = [];
  input.match(/.{2}/g)!.forEach(element => {
    result.push(Number('0x'+element))
  });
  return result;
}

export function bufferToHexA(input: Buffer): number[] {
  let result: number[] = [];
  input.forEach(element => {
    result.push(Number(element))
  });
  return result;
}

export function hexAToString(input: number[], addHexPrefix: boolean = false): string {
  let result: string = '';

  input.forEach((num: number) => {
    result = result + (result !== '' ? ' ' : '');

    let hexNum: string = num.toString(16);
    while (hexNum.length < 2) {
      hexNum = '0' + hexNum;
    }

    result = result + (addHexPrefix ? '0x' : '') + hexNum;
  });

  return result;
}


export function toSigned16Bit(unsigned: number): number {
  return -(unsigned & 0x8000) | (unsigned & 0x7fff);
}
