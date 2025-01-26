export type Samples = Sample[]

export type Sample = {
  timestamp: bigint,
  data: {
    x: number,
    y: number,
    z: number
  }
}
