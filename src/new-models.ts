export interface FinalYAMLObject {
  overall: OverallData;
  plans: PlanHashes;
  locations: LocationHashes;
}

export interface OverallData {
  totalCameras: number;
  totalLocations: number;
  SOCTools: string;
  directoryIntegration: string;
  reporting: string;
}

export interface PlanHashes {
  [hash: string]: PlanAttributes;
}

export interface PlanAttributes {
  cloudRetention: string;
  cameraActivity: string;
  indexing: IndexingTypes;
  overages: string;
  cameraResolution: string;
  addOnFeatures: Array<AddOn>;
}

export interface IndexingTypes {
  type: string;
  queries: string;
}

export interface AddOn {
  [addOnTitle: string]: number; // rate
}

export interface LocationHashes {
  [hash: string]: LocationAttributes;
}

export interface LocationAttributes {
  numCameras: number;
  planIds: PlanIdCounts;
}

export interface PlanIdCounts {
  [planHash: string]: number;
}
