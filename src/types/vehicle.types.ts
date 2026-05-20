export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehiclePayload {
  plate: string;
  brand: string;
  model: string;
  year: number;
  available: boolean;
}
