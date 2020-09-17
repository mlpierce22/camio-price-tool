<template>
  <v-app>
    <v-main>
      <TheEditPlanModal
        v-if="showEditPlanModal"
        :dialogOpen="showEditPlanModal"
        :planData="editModalFormData"
        :defaults="defaults"
        :planId="planEditingId"
        @delete-plan="deletePlan"
        @add-plan="addPlan"
        @close-edit="showEditPlanModal = false"
      />
      <template v-if="progressionState.onStep != progressionState.maxStep">
        <v-stepper
          :alt-labels="true"
          v-model="progressionState.onStep"
          class="app-container"
          v-resize="checkOrientation"
          v-if="!isVertical"
          key="horizontal-stepper"
        >
          <v-stepper-header v-show="progressionState.furthestStep != 1">
            <template class="app-steps" v-for="(step, index) in dynamicSlides">
              <v-divider v-if="index !== 0" :key="`${index}`"></v-divider>
              <v-stepper-step
                :key="`${index}-step`"
                :step="step.stepNumber"
                :complete="step.stepNumber < progressionState.furthestStep"
                :editable="step.stepNumber < progressionState.furthestStep"
                edit-icon="$complete"
                class="stepper-step-horizontal"
                :color="chooseColor(step.stepNumber)"
              >
                {{ step.stepName }}
              </v-stepper-step>
            </template>
          </v-stepper-header>
          <v-stepper-items class="app-content">
            <template v-for="(step, index) in dynamicSlides">
              <v-stepper-content
                :key="`${index}-content`"
                :step="step.stepNumber"
              >
                <keep-alive>
                  <component
                    :is="step.instance"
                    :isVertical="isVertical"
                    v-bind="buildInputObject(step.props)"
                    v-on="step.events"
                  ></component>
                </keep-alive>

                <VBackNextButton
                  v-if="step['navButtons']"
                  @next-click="nextStep()"
                  @back-click="prevStep()"
                  :next="step['navButtons']['nextText']"
                  :back="step['navButtons']['backText']"
                />
              </v-stepper-content>
            </template>
          </v-stepper-items>
        </v-stepper>

        <v-stepper
          v-model="progressionState.onStep"
          class="app-container"
          v-resize="checkOrientation"
          vertical
          v-else
          key="vertical-stepper"
        >
          <template v-for="(step, index) in dynamicSlides">
            <v-stepper-step
              class="vert-step"
              :complete="step.stepNumber < progressionState.furthestStep"
              :editable="step.stepNumber < progressionState.furthestStep"
              :key="`${index}-step-vert`"
              :step="step.stepNumber"
              :color="chooseColor(step.stepNumber)"
              edit-icon="$complete"
              v-show="hideAllExceptFirst(step.stepNumber)"
            >
              {{ step.stepName }}
            </v-stepper-step>
            <v-stepper-content
              :key="`${index}-content-vert`"
              :step="step.stepNumber"
              :class="{
                'hide-border': !hideAllExceptFirst(step.stepNumber)
              }"
            >
              <keep-alive>
                <component
                  :is="step.instance"
                  :isVertical="isVertical"
                  v-bind="buildInputObject(step.props)"
                  v-on="step.events"
                ></component>
              </keep-alive>
              <VBackNextButton
                v-if="step['navButtons']"
                @next-click="nextStep()"
                @back-click="prevStep()"
                :next="step['navButtons']['nextText']"
                :back="step['navButtons']['backText']"
              />
            </v-stepper-content>
          </template>
        </v-stepper>
      </template>
      <template v-else>
        <!-- Show Done screen! -->
        <TheDonePage @edit="prevStep" @start-over="resetToDefaults" />
      </template>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TheQuoteIntroPage from "@/components/TheQuoteIntroPage.vue";
import TheAccountPage from "@/components/TheAccountPage.vue";
import TheCreatePlansPage from "@/components/TheCreatePlansPage.vue";
import TheAddLocationsPage from "@/components/TheAddLocationsPage.vue";
import TheEstimatePage from "@/components/TheEstimatePage.vue";
import VBackNextButton from "@/components/shared/VBackNextButton.vue";
import TheDonePage from "@/components/TheDonePage.vue";
import TheEditPlanModal from "@/components/TheEditPlanModal.vue";
import {
  QuoteIntroForm,
  FormSteps,
  FormPlaceHolder,
  PropBuilderOptions,
  ComponentProps,
  PromptedNumberInputObject,
  AccountForm,
  AccountSubForm,
  CamResolution,
  Plan,
  FullFilteredPlan,
  AddOn,
  AddOnOpts,
  PlanTemplates
} from "@/models";
import {
  FinalYAMLObject,
  OverallData,
  OverallChange,
  DefaultChange
} from "@/new-models";
import {
  possibleOptions,
  planTemplates,
  accountFormData,
  pricingObject,
  megapixelMappings
} from "@/form-data-templates";

/** Set the initial state of the function - allows us to reset everything. */
function initialState(componentInstance) {
  return {
    isVertical: false,
    orientationThreshold: 600,
    progressionState: {
      // Options for steps 1 (intro), 2 (account), 3 (plans), 4 (locations), 5 (review), 6 (done!)
      // NOTE: None of these are indexes
      furthestStep: 1,
      onStep: 1,
      maxStep: 6,
      showLocations: true,
      locationStep: 4
    },
    showEditPlanModal: false,
    editModalFormData: new Array<AccountForm>(),
    planEditingId: 0,
    // Include in Compression
    finalYAMLObject: {
      overall: {
        totalCameras: 10, // TODO: should this be updatable or final??
        totalLocations: 1,
        socTools: possibleOptions().socTools[0], // None
        directoryIntegration: possibleOptions().directoryIntegration[0], // None
        reporting: possibleOptions().reporting[0] // Basic
      },
      plans: {},
      locations: {
        1: {
          title: "Location 1",
          numCameras: 1,
          planIds: { 1: 1 }, // set some default // TODO: Shoudl this be a MAP so its ordered??? like so: new Map([["1", 1]]), would need to update everywhere that uses this
          useVM: false
        }
      }
    } as FinalYAMLObject,
    defaults: {}, // Include in Compression
    steps: [
      {
        stepNumber: 1,
        stepIndex: 0,
        stepName: "Introduction",
        instance: TheQuoteIntroPage,
        navButtons: {
          nextText: "Choose Defaults"
        },
        events: {
          "change-overall": componentInstance.changeOverall
        },
        props: {
          get: [
            {
              field: "overall",
              getterFunction: "getOverall",
              importedFunction: null
            }
          ],
          formItems: [
            {
              key: "totalCameras",
              prompt: "How many cameras do you have?",
              units: "Cameras"
            },
            {
              key: "totalLocations",
              prompt: "Across how many LAN locations are your cameras located?",
              units: "Location"
            }
          ] as Array<QuoteIntroForm>
        }
      },
      {
        stepNumber: 2,
        stepIndex: 1,
        stepName: "Account",
        instance: TheAccountPage,
        navButtons: {
          nextText: "Create",
          backText: "Back"
        },
        events: {
          "change-overall": componentInstance.changeOverall,
          "add-default": componentInstance.addDefault,
          "remove-default": componentInstance.removeDefault,
          "modify-default": componentInstance.modifyDefault
        },
        props: {
          get: [
            {
              field: "formData",
              getterFunction: "getDefaultsForm",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 3,
        stepIndex: 2,
        stepName: "Plans",
        instance: TheCreatePlansPage,
        navButtons: {
          nextText: "Assign",
          backText: "Back"
        },
        events: {
          "add-plan": componentInstance.addPlan,
          "edit-plan": componentInstance.openEditPlanModal
        },
        props: {
          get: [
            {
              field: "planTemplates",
              getterFunction: "getFilteredPlanTemplates",
              importedFunction: null
            },
            {
              field: "accountData",
              getterFunction: "getFilteredAccountData",
              importedFunction: null
            },
            {
              field: "createdPlans",
              getterFunction: "getPlans",
              importedFunction: null
            },
            {
              field: "isVertical",
              getterFunction: "",
              importedFunction: null
            },
            {
              field: "defaults",
              getterFunction: "",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 4,
        stepIndex: 3,
        stepName: "Locations",
        instance: TheAddLocationsPage,
        navButtons: {
          nextText: "Estimate",
          backText: "Back"
        },
        events: {
          "add-location": componentInstance.addLocation,
          "modify-location": componentInstance.modifyLocation,
          "delete-location": componentInstance.deleteLocation,
          "modify-plan": componentInstance.modifyPlan,
          "edit-plan": componentInstance.openEditPlanModal
        },
        props: {
          get: [
            {
              field: "plans",
              getterFunction: "getPlans",
              importedFunction: null
            },
            {
              field: "initialFormData",
              getterFunction: "getOverall",
              importedFunction: null
            },
            {
              field: "locations",
              getterFunction: "getLocations",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 5,
        stepIndex: 4,
        stepName: "Review",
        instance: TheEstimatePage,
        navButtons: {
          nextText: "Finish",
          backText: "Back"
        },
        events: {},
        props: {
          get: [
            {
              field: "finalYAMLObject",
              getterFunction: "",
              importedFunction: null
            },
            {
              field: "titles",
              getterFunction: "getFieldTitles",
              importedFunction: null
            }
          ],
          pricing: pricingObject(),
          mpMapping: megapixelMappings()
        }
      },
      {
        stepNumber: 6,
        stepIndex: 5,
        stepName: "Done"
      }
    ] as Array<FormSteps | FormPlaceHolder>
  };
}

export default Vue.extend({
  components: {
    TheQuoteIntroPage,
    TheAccountPage,
    TheCreatePlansPage,
    TheAddLocationsPage,
    TheEstimatePage,
    TheDonePage,
    VBackNextButton,
    TheEditPlanModal
  },
  data: function() {
    return initialState(this);
  },
  computed: {
    getFilteredAccountData: function() {
      const data = accountFormData();
      return data.filter(field => {
        // special case because we still want to show addons, if they exist
        if (field.fieldName == "addOns") {
          if (this.defaults[field.fieldName]) {
            const filteredSelected = ((field as AccountForm)
              .selectionOpts as AddOnOpts[]).filter(selected => {
              return !this["defaults"][field.fieldName].includes(selected.name);
            });
            return filteredSelected.length !== 0;
          }
          return true;
        }
        return this["defaults"][field.fieldName] ||
          field.fieldName == "advancedOptions"
          ? false
          : true;
      });
    },
    getFilteredPlanTemplates: function() {
      const planTemplatesToFilter = planTemplates();
      const filtered = Object.keys(planTemplatesToFilter).map(key => {
        return {
          title: key,
          templateOptions: planTemplatesToFilter[key].filter(planOption => {
            // special case because we still want to show addons, if they exist
            if (planOption.fieldName == "addOns") {
              if (this.defaults[planOption.fieldName]) {
                const filteredSelected = possibleOptions().addOns.filter(
                  selected =>
                    !this.defaults[planOption.fieldName].includes(selected.name)
                );
                return filteredSelected.length !== 0;
              }
              return true;
            }
            // if it is in defaults, don't return it
            return this.defaults[planOption.fieldName] ? false : true;
          })
        };
      });
      const reconstructed = {};
      filtered.map(planTemplates => {
        reconstructed[planTemplates.title] = planTemplates.templateOptions;
      });
      return reconstructed;
    },
    getDefaultsForm: function() {
      const form = accountFormData();
      form.map(formObject => {
        if (formObject.fieldName == "advancedOptions") {
          (formObject as AccountSubForm).subForm = (formObject as AccountSubForm).subForm.map(
            form => {
              form.selected = this.finalYAMLObject.overall[form.fieldName];
              return form;
            }
          );
        } else if (this.defaults[formObject.fieldName]) {
          (formObject as AccountForm).selected = this.defaults[
            formObject.fieldName
          ];
        }
      });
      return form;
    },
    getLocations: function() {
      return this["finalYAMLObject"].locations;
    },

    getPlans: function() {
      return this["finalYAMLObject"].plans;
    },

    getOverall: function() {
      return this["finalYAMLObject"].overall;
    },
    getFieldTitles: function() {
      const tempObj = {};
      planTemplates()[Object.keys(planTemplates())[0]].map(planField => {
        tempObj[planField.fieldName] = planField.prompt;
      });
      accountFormData()
        .filter(field => field.fieldName == "advancedOptions")
        .map(field => {
          (field as AccountSubForm).subForm.map(subField => {
            tempObj[subField.fieldName] = subField.prompt;
          });
        });
      return tempObj;
    },
    dynamicSlides: function(): FormSteps[] {
      if (this.progressionState.showLocations === false) {
        const firstSteps: {}[] = this.steps.slice(
          0,
          this.progressionState.locationStep - 1
        );
        const lastSteps = this.steps
          .slice(this.progressionState.locationStep, this.steps.length)
          .map((arrItem, indx) => {
            arrItem.stepNumber = this.progressionState.locationStep + indx;
            arrItem.stepIndex = this.progressionState.locationStep + indx - 1;

            return arrItem;
          });
        return [].concat(firstSteps as [], lastSteps as []);
      } else {
        const renumbered = this.steps.map((step, index) => {
          const newStep = step;
          newStep.stepNumber = index + 1;
          newStep.stepIndex = index;
          return newStep;
        });
        return [].concat(renumbered as []);
      }
    }
  },
  watch: {
    isVertical: function() {
      const currStep = this.progressionState.onStep;
      this.progressionState.onStep = 1;
      requestAnimationFrame(() => (this.progressionState.onStep = currStep));
    }
  },
  created() {
    this.$vuetify.theme.themes.light.primary = "#f7931e";
    this.$vuetify.theme.themes.light.secondary = "#50B536";
    this.$vuetify.theme.themes.light.error = "#FF0000";
  },
  methods: {
    // BEGIN FUNCTIONS TO MODIFY FINAL YAML OBJECT
    changeOverall(change: OverallChange) {
      const totalLocations = this.finalYAMLObject.overall.totalLocations;
      if (change.key == "totalLocations") {
        if (change.value > totalLocations) {
          for (let i = totalLocations + 1; i <= change.value; ++i) {
            this.addLocation();
          }
        } else if (change.value < totalLocations) {
          for (let i = (change.value as number) + 1; i <= totalLocations; ++i) {
            this.deleteLocation(i);
          }
        }
      } else {
        this.$set(this.finalYAMLObject.overall, change.key, change.value);
      }
    },

    addLocation() {
      const newLocNum = Object.keys(this.finalYAMLObject.locations).length + 1;
      this.$set(this.finalYAMLObject.locations, newLocNum, {
        title: "Location " + newLocNum,
        numCameras: 1,
        planIds: { 1: 1 }, // set some default
        useVM: false
      });
      this.$set(
        this.finalYAMLObject.overall,
        "totalLocations",
        Object.keys(this.finalYAMLObject.locations).length
      );
    },

    deleteLocation(locationId: number) {
      const totalLocations = Object.keys(this.finalYAMLObject.locations).length;
      if (totalLocations > 1) {
        this.$delete(this.finalYAMLObject.locations, locationId);
        this.$set(
          this.finalYAMLObject.overall,
          "totalLocations",
          totalLocations - 1
        );
      }
    },
    modifyLocation(toEdit: { index: number; field: string; payload: any }) {
      this.$set(
        this.finalYAMLObject.locations[toEdit.index],
        toEdit.field,
        toEdit.payload
      );
    },
    addDefault(payload: DefaultChange) {
      this.$set(this.defaults, payload.field, payload.value);
    },
    removeDefault(fieldToRemove: string) {
      this.$delete(this.defaults, fieldToRemove);
    },
    modifyDefault(payload: DefaultChange) {
      this.$set(this.defaults, payload.field, payload.value);
    },
    addPlan(payload: {
      resolutionsToHandle: Array<CamResolution>;
      plan: Array<AccountForm>;
    }) {
      const defaultKeys = Object.keys(this.defaults);
      const plans = payload.resolutionsToHandle.map(
        (cameraResolution: CamResolution) => {
          const purePlanObj = {};
          payload.plan.map(planField => {
            // Assign the title to the resolution field (since it isnt handled in the plan)
            if (planField.fieldName == "resolution") {
              purePlanObj[planField.fieldName] = cameraResolution.title;

              // handle custom naming if multiple resolutions
            } else if (
              planField.fieldName == "title" &&
              payload.resolutionsToHandle.length > 1
            ) {
              purePlanObj[planField.fieldName] =
                planField.selected + " w/" + cameraResolution.title;
            } else {
              purePlanObj[planField.fieldName] = planField.selected;
            }
          });
          // add defaults and try to merge if key exists
          defaultKeys.map(key => {
            // currently that means it is resolution or addons
            if (purePlanObj[key]) {
              if (Array.isArray(purePlanObj[key])) {
                purePlanObj[key] = [].concat(
                  purePlanObj[key],
                  this.defaults[key]
                    .map(value => {
                      if (
                        !purePlanObj[key].map(obj => obj.name).includes(value)
                      ) {
                        return { name: value, rate: 100 };
                      } else {
                        return undefined;
                      }
                    })
                    .filter(val => val)
                );
              }
            } else {
              purePlanObj[key] = this.defaults[key];
            }
          });
          // Add num cameras field
          purePlanObj["numCameras"] = cameraResolution.numCameras;
          // represents how many cameras are assigned to a location
          purePlanObj["camerasAssigned"] = 0;

          return purePlanObj;
        }
      );
      plans.forEach(plan => {
        const planCode = this.generatePlanCode(plan);
        this.$set(this.finalYAMLObject.plans, planCode, plan);
      });
      console.log("added this plan!", plans);
    },

    deletePlan(planId: string) {
      // delete plans from locations
      Object.keys(this.finalYAMLObject.locations).map(locKey => {
        const planIdsCopy = {
          ...this.finalYAMLObject.locations[locKey].planIds
        };
        const planCount = planIdsCopy[planId];
        // if the plan exists at this location
        if (planCount) {
          delete planIdsCopy[planId];
          // update planids, then update number of locations
          this.modifyLocation({
            index: Number(locKey),
            field: "planIds",
            payload: planIdsCopy
          });
          this.modifyLocation({
            index: Number(locKey),
            field: "numCameras",
            payload:
              this.finalYAMLObject.locations[locKey].numCameras - planCount
          });
        }
      });

      // delete plan from plans
      if (this.finalYAMLObject.plans[planId]) {
        this.$delete(this.finalYAMLObject.plans, planId);
      }
    },

    modifyPlan(payload: { planId: number; field: string; payload: any }) {
      if (Array.isArray(payload)) {
        payload.forEach(planToModify => {
          this.$set(
            this.finalYAMLObject.plans[planToModify.planId],
            planToModify.field,
            planToModify.payload
          );
        });
      } else {
        this.$set(
          this.finalYAMLObject.plans[payload.planId],
          payload.field,
          payload.payload
        );
      }
    },

    openEditPlanModal(planId: number) {
      const plan = this.getPlans[planId];
      const accountData = this.getFilteredAccountData.filter(
        field => field.fieldName !== "advanced-options"
      ) as AccountForm[];
      const planTemplates = this.getFilteredPlanTemplates["Basic"].map(
        planField => {
          const matchingData = accountData.find(
            item => item.fieldName == planField.fieldName
          );
          return { ...matchingData, ...planField };
        }
      );

      const accountWithPlan = planTemplates.map(field => {
        if (plan[field.fieldName]) {
          field.selected = plan[field.fieldName];
          field.formType = field.formType.replace(
            "yes-no-select",
            "pure-component"
          );
        }
        return field;
      });

      // add title at the beginning
      accountWithPlan.unshift({
        fieldName: "title",
        formType: "pure-component-textbox",
        isDefault: false,
        prompt: "Plan Name",
        subPrompt: "",
        selectionOpts: [""],
        selected: plan["title"]
      });

      // Then, open the modal
      this.editModalFormData = accountWithPlan;
      this.showEditPlanModal = true;
      this.planEditingId = planId;
    },
    buildInputObject(props: ComponentProps) {
      if (props) {
        const propObject = {};
        Object.keys(props).map(key => {
          if (key == "get") {
            props[key].forEach(prop => {
              if (prop.getterFunction !== "") {
                this.$set(propObject, prop.field, this[prop.getterFunction]);
              } else if (prop.importedFunction) {
                this.$set(propObject, prop.field, prop.importedFunction);
              } else {
                this.$set(propObject, prop.field, this[prop.field]);
              }
            });
          } else {
            this.$set(propObject, key, props[key]);
          }
        });

        console.log(propObject);
        return propObject;
      }
      // Done case
      return;
    },
    resetToDefaults: function() {
      const data = initialState(this);
      Object.keys(data).forEach(key => (this[key] = data[key]));
    },
    chooseColor: function(stepNumber) {
      if (stepNumber < this.progressionState.furthestStep) {
        return "secondary";
      } else {
        return "primary";
      }
    },
    hideAllExceptFirst: function(currentStep) {
      return this.progressionState.furthestStep != 1 || currentStep == 1;
    },
    checkOrientation: function() {
      this.isVertical = window.innerWidth <= this.orientationThreshold;
    },
    // TODO: Determine hashing function
    // TODO: let a user know if they have already generated a plan with that plan id... probably means that
    // we need to get rid of the title and only check the "options" when hashing
    generatePlanCode(plan) {
      // Courtesy of https://stackoverflow.com/a/33647870
      let hash = 0;
      let i = 0;
      const str = JSON.stringify(plan);
      const length = str.length;

      while (i < length) {
        hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
      }

      return hash;
    },
    handleOneLocationCase() {
      const planIds = {};
      const locationKey = Number(
        Object.keys(this.finalYAMLObject.locations)[0]
      );
      Object.keys(this.getPlans).map(key => {
        planIds[key] = this.getPlans[key].numCameras;
        this.modifyPlan({
          planId: Number(key),
          field: "camerasAssigned",
          payload: this.getPlans[key].numCameras
        });
      });

      this.modifyLocation({
        index: locationKey,
        field: "planIds",
        payload: planIds
      });
    },
    nextStep: function() {
      // If we are on the first step, we need to decide whether or not to show locations
      if (
        this.finalYAMLObject.overall.totalLocations == 1 &&
        this.progressionState.onStep == 1
      ) {
        this.progressionState.showLocations = false;
      } else if (
        this.finalYAMLObject.overall.totalLocations > 1 &&
        this.progressionState.onStep == 1
      ) {
        this.progressionState.showLocations = true;
      }

      // If the next step is the location step and we are not showing locations
      if (
        this.progressionState.locationStep ==
          this.progressionState.onStep + 1 &&
        !this.progressionState.showLocations
      ) {
        // then assign all plans to one and only location and go to estimate page
        this.handleOneLocationCase();
      }
      // Change the max steps to match
      this.progressionState.maxStep = this.dynamicSlides.length;

      // Update the current step as long as it is less than or equal to the maxStep
      if (this.progressionState.onStep + 1 <= this.progressionState.maxStep) {
        this.progressionState.onStep++;
      }
      this.progressionState.furthestStep = Math.max(
        this.progressionState.onStep,
        this.progressionState.furthestStep
      );
    },
    prevStep: function() {
      if (this.progressionState.onStep - 1 >= 1) {
        this.progressionState.onStep--;
      }
    }
  }
});
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  border: 3px solid #f7931e;
  border-radius: 20px;
  margin: 30px 10.3%;

  @media only screen and (max-width: 502px) {
    margin: 10px;
  }

  .v-stepper__step {
    flex-basis: 0;
  }

  .v-divider {
    max-width: 13%;
    margin: 45px -67px 0 !important;

    @media only screen and (max-width: 790px) {
      max-width: 6vw;
    }
  }

  .v-stepper__header {
    box-shadow: none;
    border-bottom: 3px #f7931e solid;
  }

  .stepper-step-horizontal {
    ::v-deep .v-stepper__label {
      display: flex !important;
    }

    ::v-deep .v-stepper__step__step {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }
  }

  .vert-step {
    ::v-deep .v-stepper__step__step {
      width: 40px;
      height: 40px;
      font-size: 18px;
      margin-left: -7px;
    }
  }

  .v-stepper__label {
    display: flex !important;
  }

  .hide-border {
    border-left: none !important;
  }

  .app-content {
    padding: 0px 40px 40px 40px;

    @media only screen and (max-width: 650px) {
      padding: 40px;
    }
  }
}
</style>
