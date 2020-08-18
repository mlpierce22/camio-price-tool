import { Component } from "vue/types/umd";

export interface QuoteIntroForm {
  [index: string]: PromptedNumberInputObject;
}

export interface PromptedNumberInputObject {
  prompt: string;
  units: string;
  value: number;
}
export interface SimpleButtonOptions {
  text: string;
  click: Function;
}

export interface BackNextButtonConfig {
  nextText?: SimpleButtonOptions;
  backText?: SimpleButtonOptions;
  events?: { [eventName: string]: Function };
}

export interface BackNextButton {
  component: Component;
  config: BackNextButtonConfig;
}

export interface ComponentEvents {
  [eventName: string]: Function;
}

export interface PropList {
  [propName: string]: QuoteIntroForm; // TODO: Add all types here
}

export interface FormSteps {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
  instance: Component;
  navButtons: BackNextButton;
  events?: ComponentEvents;
  props?: PropList;
}

export interface FormPlaceHolder {
  stepNumber: number;
  stepIndex: number;
  stepName: string;
}
