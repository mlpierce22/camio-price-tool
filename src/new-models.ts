export interface FinalYAMLObject {
  overall: OverallData;
  plans: PlanHashes;
  locations: LocationHashes;
}

export interface OverallData {
  totalCameras: number;
  totalLocations: number;
  socTools: string;
  directoryIntegration: string;
  reporting: string;
}

export interface OverallChange {
  key: string;
  value: string | number;
}

export interface DefaultChange {
  field: string;
  value: any;
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
  [id: number]: LocationAttributes;
}

export interface LocationAttributes {
  title: string;
  numCameras: number;
  planIds: PlanIdCounts;
  useVM: boolean;
}

export interface PlanIdCounts {
  [planHash: string]: number;
}
