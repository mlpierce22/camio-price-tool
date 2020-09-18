import { Component } from "vue/types/umd";

export interface QuoteIntroForm {
  key: string;
  prompt: string;
  units: string;
}

export interface PromptedNumberInputObject {
  value: number;
  prompt: string;
  units: string;
  key: string;
}

export interface BackNextButtonConfig {
  nextText?: string;
  backText?: string;
}

export interface ComponentEvents {
  [eventName: string]: Function;
}

// export interface PropList {
//   [propName: string]: QuoteIntroForm | any; // TODO: Add all types here
// }

export interface FormSteps {
  stepNumber: number;
  stepId: number;
  stepName: string;
  instance: Component;
  navButtons: BackNextButtonConfig;
  events?: ComponentEvents;
  props: ComponentProps;
}

export interface FormPlaceHolder {
  stepNumber: number;
  stepId: number;
  stepName: string;
}

export interface FormItem extends AccountForm {
  selectionOptions: any;
}
export interface AccountForm {
  fieldName: string;
  isDefault: boolean;
  formType: string;
  prompt: string;
  subPrompt: string;
  subSubPrompts?: { [topKey: string]: string };
  selected: string | TwoTierSelection | AddOn[];
  selectionOpts: string[] | AddOnOpts[] | TwoTierSelectionOpts;
}

export interface AccountSubForm {
  fieldName: string;
  advanced: boolean;
  subForm: Array<Omit<AccountForm, "subPrompt">>;
}

export interface FullFilteredPlan {
  fieldName: string;
  isDefault: boolean;
  formType: string;
  prompt: string;
  subPrompt: string;
  subSubPrompt?: string[];
  selected: string | TwoTierSelection | AddOn[];
  selectionOpts: string[] | AddOnOpts[] | TwoTierSelectionOpts;
}

export interface TwoTierSelection {
  type: string;
  option: string; // could be a number, depends
}

export interface TwoTierSelectionOpts {
  [type: string]: string[];
}

export interface PlanTemplates {
  [key: string]: Array<BasePlanOpts>;
}

export interface PlanTemplateWithDefaults extends BasePlanOpts {
  isDefault: boolean;
}

export interface BasePlanOpts {
  fieldName: string;
  selected: string | TwoTierSelection | string[] | Array<AddOn>;
  prompt: string;
}

export interface AddOn {
  name: string;
  rate: number;
}

export interface AddOnOpts {
  name: string;
  rate: number[];
}

export interface PropBuilderOptions {
  field: string;
  getterFunction: string;
  importedFunction: Function | null;
}

export interface ComponentProps {
  get: Array<PropBuilderOptions>;
  [propName: string]: Record<string, any>;
}

export interface Plan {
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

// export interface LocationAttrib {
//   title: string;
//   numCameras: number;
//   useVM: boolean;
//   planIds: PlanCount;
// }

// export interface Location {
//   [index: number]: LocationAttrib;
// }

export interface PlanCount {
  [planHash: string]: number; // represents the plan hash followed by the number of cameras of that plan in this location
}

export interface CamResolution {
  title: string;
  numCameras: number;
  cameraOpts: string[];
}

export interface DeconstructedHashPlan {
  planKey: string;
  planData: PlanAttributes;
}

export interface ProgressionState {
  furthestStep: number;
  onStep: number;
  maxStep: number;
  showLocations: boolean;
  locationStepId: number;
  planStepId: number;
}
