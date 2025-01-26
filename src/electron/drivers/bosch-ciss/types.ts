export type Samples = Sample[]

export type Sample = {
  timestamp: bigint,
  data: {
    x: number,
    y: number,
    z: number
  }
}

export interface PortInfo {
  path: string;
  manufacturer: string | undefined;
  serialNumber: string | undefined;
  pnpId: string | undefined;
  locationId: string | undefined;
  productId: string | undefined;
  vendorId: string | undefined;
}
