export type DhlSolution = "MyDHL+" | "DEC" | "MyDHL API" | "DCIS";

export interface SessionInput {
  businessType: string;
  mainProduct: string;
  monthlyShipments: number;
  originCountry: string;
  destinationCountry: string;
  hasItSystem: boolean | null; // true=있음, false=없음, null=모르겠음
}

export interface SessionResult {
  id: string;
  key: string;
  input: SessionInput;
  recommendedSolution: DhlSolution;
  recommendationReason: string;
  createdAt: string;
}

export interface RecommendResponse {
  solution: DhlSolution;
  reason: string;
}
