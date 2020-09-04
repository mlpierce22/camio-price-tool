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

export interface DefaultMap {
  [fieldName: string]: any;
}

export interface PlanHashes {
  [hash: string]: PlanAttributes;
}

export interface PlanAttributes {
  // These could all be numbers pretty much
  title: string;
  cloudRetention: string;
  cameraMotion: string;
  indexing: { type: string; queries: string };
  overageHandling: string;
  resolution: string;
  numCameras: number;
  camerasAssigned: number;
  addOns: AddOn[];
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

export interface MPCounts {
  xMPCount: number;
  xMP: string;
  twoMPCount?: number;
}
