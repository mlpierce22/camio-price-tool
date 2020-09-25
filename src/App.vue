<template>
  <v-app>
    <v-main>
      <TheEditPlanModal
        v-if="showEditPlanModal"
        :dialogOpen="showEditPlanModal"
        :planData="editModalFormData"
        :defaults="defaults"
        :planId="planEditingId"
        :plans="getPlans"
        :isVertical="isVertical"
        @delete-plan="deletePlan"
        @add-plan="addPlan"
        @close-edit="showEditPlanModal = false"
      />
      <div class="app-title">Get a Quote</div>
      <v-stepper
        :alt-labels="true"
        v-model="progressionState.onStep"
        class="app-container"
        v-resize="checkOrientation"
        v-if="!isVertical"
        key="horizontal-stepper"
        @change="goToStep(progressionState.onStep)"
      >
        <v-stepper-header v-show="showStepperHeader">
          <template class="app-steps" v-for="(step, index) in dynamicSlides">
            <v-divider v-if="index !== 0" :key="`${step.stepId}`"></v-divider>
            <v-stepper-step
              class="stepper-step-horizontal"
              :key="`${step.stepId}-step`"
              :step="step.stepNumber"
              :complete="step.stepNumber < progressionState.furthestStep"
              :editable="step.stepNumber < progressionState.furthestStep"
              :color="chooseColor(step.stepNumber)"
              edit-icon="$complete"
            >
              {{ step.stepName }}
            </v-stepper-step>
          </template>
        </v-stepper-header>
        <v-stepper-items class="app-content">
          <template v-for="step in dynamicSlides">
            <v-stepper-content
              :key="`${step.stepId}-content`"
              :step="step.stepNumber"
            >
              <keep-alive>
                <component
                  :key="
                    `${step.stepId}-horizontal-component-${baseComponentsKey}`
                  "
                  :is="step.instance"
                  :isVertical="isVertical"
                  v-bind="buildInputObject(step.props)"
                  v-on="step.events"
                ></component>
              </keep-alive>

              <VBackNextButton
                v-if="step['navButtons']"
                @next-click="goToStep(progressionState.onStep + 1)"
                @back-click="goToStep(progressionState.onStep - 1)"
                :next="step['navButtons']['nextText']"
                :back="step['navButtons']['backText']"
                :canAdvance="step.canAdvance"
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
        @change="goToStep(progressionState.onStep)"
      >
        <template v-for="step in dynamicSlides">
          <v-stepper-step
            class="vert-step"
            :key="`${step.stepId}-step-vert`"
            :step="step.stepNumber"
            :complete="step.stepNumber < progressionState.furthestStep"
            :editable="step.stepNumber < progressionState.furthestStep"
            :color="chooseColor(step.stepNumber)"
            edit-icon="$complete"
            v-show="showStepperHeader"
          >
            {{ step.stepName }}
          </v-stepper-step>
          <v-stepper-content
            :key="`${step.stepId}-content-vert`"
            :step="step.stepNumber"
            :class="{
              'hide-border': !showStepperHeader
            }"
          >
            <keep-alive>
              <component
                :key="`${step.stepId}-vertical-component-${baseComponentsKey}`"
                :is="step.instance"
                :isVertical="isVertical"
                v-bind="buildInputObject(step.props)"
                v-on="step.events"
              ></component>
            </keep-alive>
            <VBackNextButton
              v-if="step['navButtons']"
              @next-click="goToStep(progressionState.onStep + 1)"
              @back-click="goToStep(progressionState.onStep - 1)"
              :next="step['navButtons']['nextText']"
              :back="step['navButtons']['backText']"
              :canAdvance="step.canAdvance"
            />
          </v-stepper-content>
        </template>
      </v-stepper>
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
  PlanTemplates,
  ProgressionState,
  User
} from "@/models";
import {
  FinalYAMLObject,
  OverallData,
  OverallChange,
  DefaultChange,
  LocationHashes,
  PlanHashes
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
    baseComponentsKey: 1234567, // A random number generated so that the components are not reused on reset
    isVertical: false,
    orientationThreshold: 600,
    progressionState: {
      // Options for steps 1 (intro), 2 (account), 3 (plans), 4 (locations), 5 (review), 6 (done!)
      // NOTE: None of these are indexes
      furthestStep: 1,
      onStep: 1,
      maxStep: 6,
      showLocations: true,
      locationStepId: 4,
      planStepId: 3
    } as ProgressionState,
    hiddenSlideIds: [3, 4], // default to the locations and plans hidden
    stepperHiddenSlideIds: [1, 6], // hide the stepper on the first step by default, second index will be updated on navigation
    showEditPlanModal: false,
    editModalFormData: new Array<AccountForm>(),
    planEditingId: 0,
    // Include in Compression
    finalYAMLObject: {
      overall: {
        totalCameras: 10, // This is updated every time a new plan is added.
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
    defaults: {
      // all are set as default initially
      resolution: "2 MP",
      cloudRetention: "30 day",
      cameraMotion: "6 hrs",
      overageHandling: "Lazy",
      indexing: { type: "Lazy", option: "7 days" },
      addOns: []
    }, // Include in Compression
    user: {
      email: "",
      quoteSent: false,
      quoteSending: false,
      quoteError: false
    } as User,
    steps: [
      {
        stepNumber: 1, // Note that this changes
        stepId: 1,
        stepName: "Introduction",
        canAdvance: true,
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
        stepId: 2,
        stepName: "Account",
        canAdvance: true,
        instance: TheAccountPage,
        navButtons: {
          nextText: "Create Plans",
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
        stepNumber: 3,
        stepId: 3,
        stepName: "Plans",
        canAdvance: false,
        instance: TheCreatePlansPage,
        navButtons: {
          nextText: "Assign Locations",
          backText: "Back"
        },
        events: {
          "add-plan": componentInstance.addPlan,
          "edit-plan": componentInstance.openEditPlanModal,
          "plan-advancement-change": componentInstance.setSlideAdvanceState
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
            },
            {
              field: "progressionState",
              getterFunction: "getProgressionState",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 4,
        stepId: 4,
        stepName: "Locations",
        canAdvance: false,
        instance: TheAddLocationsPage,
        navButtons: {
          nextText: "See an Estimate",
          backText: "Back"
        },
        events: {
          "add-location": componentInstance.addLocation,
          "modify-location": componentInstance.modifyLocation,
          "delete-location": componentInstance.deleteLocation,
          "modify-plan": componentInstance.modifyPlan,
          "edit-plan": componentInstance.openEditPlanModal,
          "location-advancement-change": componentInstance.setSlideAdvanceState
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
            },
            {
              field: "progressionState",
              getterFunction: "getProgressionState",
              importedFunction: null
            }
          ]
        }
      },
      {
        stepNumber: 5,
        stepId: 5,
        stepName: "Review",
        canAdvance: true,
        instance: TheEstimatePage,
        navButtons: {
          nextText: "Email Quote",
          backText: "Back"
        },
        events: {
          "save-state": componentInstance.saveState
        },
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
            },
            {
              field: "overall",
              getterFunction: "getOverall",
              importedFunction: null
            }
          ],
          pricing: pricingObject(),
          mpMapping: megapixelMappings()
        }
      },
      {
        stepNumber: 6,
        stepId: 6,
        stepName: "Done",
        canAdvance: true,
        instance: TheDonePage,
        navButtons: {},
        events: {
          "make-changes": componentInstance.goToStep,
          "start-over": componentInstance.resetToDefaults
        },
        props: {
          get: [
            {
              field: "progressionState",
              getterFunction: "getProgressionState",
              importedFunction: null
            },
            {
              field: "user",
              getterFunction: "",
              importedFunction: null
            }
          ]
        }
      }
    ] as Array<FormSteps>
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
        // this code combined with getFilteredPlanTemplates would make addons show no matter what
        // special case because we still want to show addons, if they exist
        // if (field.fieldName == "addOns") {
        //   if (this.defaults[field.fieldName]) {
        //     const filteredSelected = ((field as AccountForm)
        //       .selectionOpts as AddOnOpts[]).filter(selected => {
        //       return !this["defaults"][field.fieldName].includes(selected.name);
        //     });
        //     return filteredSelected.length !== 0;
        //   }
        //   return true;
        // }
        return this["defaults"][field.fieldName] ||
          field.fieldName == "advancedOptions"
          ? false
          : true;
      });
    },
    getFilteredPlanTemplates: function() {
      const planTemplatesToFilter = planTemplates();
      let filtered = Object.keys(planTemplatesToFilter).map(key => {
        return {
          title: key,
          templateOptions: planTemplatesToFilter[key].filter(planOption => {
            // this code combined with getFilteredAccountData would make addons show no matter what
            // special case because we still want to show addons, if they exist
            // if (planOption.fieldName == "addOns") {
            //   if (this.defaults[planOption.fieldName]) {
            //     const filteredSelected = possibleOptions().addOns.filter(
            //       selected =>
            //         !this.defaults[planOption.fieldName].includes(selected.name)
            //     );
            //     return filteredSelected.length !== 0;
            //   }
            //   return true;
            // }
            // if it is in defaults, don't return it
            return this.defaults[planOption.fieldName] ? false : true;
          })
        };
      });

      // If addons are part of the default, we don't want to have all the options, just the first one
      if (this.defaults["addOns"]) {
        console.log(filtered, Object.keys(planTemplatesToFilter)[0]);
        filtered = filtered.filter(
          planTemplate =>
            planTemplate.title == Object.keys(planTemplatesToFilter)[0]
        );
        console.log(filtered);
      }
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
              if (this.defaults[form.fieldName]) {
                form.selected = this.defaults[form.fieldName];
              } else {
                form.selected = this.finalYAMLObject.overall[form.fieldName];
              }
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
    getLocations: function(): LocationHashes {
      return this.finalYAMLObject.locations;
    },
    getPlans: function(): PlanHashes {
      return this.finalYAMLObject.plans;
    },

    getOverall: function(): OverallData {
      return this.finalYAMLObject.overall;
    },
    getProgressionState: function(): ProgressionState {
      return this.progressionState;
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
    allDefaultsSet() {
      return accountFormData()
        .filter(field => field.fieldName !== "advancedOptions")
        .every(formField => {
          // if the default does has that field, then continue
          if (this.defaults[formField.fieldName]) {
            return true;
          } else {
            console.log("false happened", formField);

            return false;
          }
        });
    },
    showStepperHeader(): boolean {
      return !this.stepperHiddenSlideIds.includes(this.progressionState.onStep);
    },
    dynamicSlides: function(): FormSteps[] {
      const newSteps = this.steps.filter((step: FormSteps) => {
        return !this.hiddenSlideIds.includes(step.stepId);
      });
      newSteps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });
      return newSteps;
    }
  },
  watch: {
    isVertical: function() {
      const currStep = this.progressionState.onStep;
      this.progressionState.onStep = 1;
      requestAnimationFrame(() => (this.progressionState.onStep = currStep));
    },
    allDefaultsSet: function(areSet) {
      const onPlanStep =
        this.progressionState.onStep == this.progressionState.planStepId;
      const onLocationStep =
        this.progressionState.onStep == this.progressionState.locationStepId;
      // as long as we are not on the plans step, update header
      if (!onPlanStep && !onLocationStep) {
        console.log("this runs???", areSet);
        if (!areSet) {
          this.hiddenSlideIds = this.hiddenSlideIds.filter(
            val => val !== this.progressionState.planStepId
          );
        } else if (
          !this.hiddenSlideIds.includes(this.progressionState.planStepId)
        ) {
          this.hiddenSlideIds.push(this.progressionState.planStepId);
        }
      }
    },
    getLocations: function(locations) {
      const numLocations = Object.keys(locations).length;
      const onPlanStep =
        this.progressionState.onStep == this.progressionState.planStepId;
      const onLocationStep =
        this.progressionState.onStep == this.progressionState.locationStepId;
      // as long as we are not on the location step or plans step, update header
      if (!onPlanStep && !onLocationStep) {
        if (numLocations > 1) {
          this.hiddenSlideIds = this.hiddenSlideIds.filter(
            val => val !== this.progressionState.locationStepId
          );
        } else if (
          numLocations == 1 &&
          !this.hiddenSlideIds.includes(this.progressionState.locationStepId)
        ) {
          this.hiddenSlideIds.push(this.progressionState.locationStepId);
        }
      }
    }
  },
  created() {
    this.$vuetify.theme.themes.light.primary = "#f7931e";
    this.$vuetify.theme.themes.light.secondary = "#50B536";
    this.$vuetify.theme.themes.light.error = "#FF0000";
    // TODO: remove this
    Vue.config.devtools = true;
  },
  mounted() {
    this.retrieveStateFromUrl();
  },
  methods: {
    async sendQuote() {
      const quoteIdExists = this.findQuoteId();
      let quoteId;
      this.user.quoteSending = true;
      this.user.quoteError = false;
      if (quoteIdExists) {
        quoteId = quoteIdExists;
      } else {
        const savedState = await this.saveState();
        if (savedState == "Failed") {
          this.user.quoteError = true;
          return;
        }
        quoteId = this.findQuoteId();
      }

      const payload = {};
      payload["hash"] = encodeURIComponent("#" + "quote_id" + "=" + quoteId);
      // TODO: what does description do??
      payload["description"] = "Test Description";
      fetch("/api/users/me/quotes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          response
            .text()
            .then(result => {
              // TODO: figure out why CSRF error is happening on send....
              if (result["user"]) {
                this.user.email = result["user"]["email"];
                this.user.quoteSent = true;
                this.user.quoteSending = false;
                this.goToStep(this.progressionState.onStep + 1);
              } else {
                console.log("result wasn't a success", result);
                this.user.quoteSent = false;
                this.user.quoteSending = false;
              }
            })
            .catch(err => {
              console.log("Couldn't read the return value", err);
              this.user.quoteSent = false;
              this.user.quoteSending = false;
            });
        })
        .catch(err => {
          console.log("Couldn't post to api", err);
          this.user.quoteSent = false;
          this.user.quoteSending = false;
        });
    },
    findQuoteId() {
      const currentUrl = window.location.href;
      if (currentUrl.includes("quote_id")) {
        const varNameIndex = currentUrl.indexOf("quote_id");
        const end = currentUrl.indexOf(";", varNameIndex);
        const stateId = currentUrl.slice(varNameIndex, end).split("=")[1];
        return stateId;
      } else {
        return undefined;
      }
    },
    retrieveStateFromUrl() {
      const currentStateId = this.findQuoteId();
      if (currentStateId) {
        fetch("/api/blobs/" + currentStateId, {
          method: "GET"
        })
          .then(jsonObject => {
            if (jsonObject.ok) {
              jsonObject
                .json()
                .then((json: string) => {
                  Object.keys(json).forEach(key => {
                    this.$set(this, key, json[key]);
                  });
                })
                .catch(err => {
                  console.log("Couldn't read the json", err);
                });
            } else {
              console.log("Fetch Failed");
            }
          })
          .catch(err => {
            console.log("Couldn't fetch from api", err);
          });
      }
    },
    saveState() {
      const saveObject = {
        finalYAMLObject: this.finalYAMLObject,
        defaults: this.defaults
      };
      return new Promise<string>((resolve, reject) => {
        fetch("/api/blobs", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(saveObject)
        })
          .then(async response => {
            if (response.ok) {
              response
                .text()
                .then(result => {
                  let currentURL = location.href;
                  const quoteId = this.findQuoteId();
                  const newId = result.replaceAll(/^"|"$/g, "");
                  if (quoteId) {
                    currentURL = currentURL.replace(quoteId, newId);
                  } else {
                    if (currentURL.includes("#")) {
                      currentURL += "quote_id=" + newId + ";";
                    } else {
                      currentURL += "#quote_id=" + newId + ";";
                    }
                  }

                  location.href = currentURL;
                  resolve(location.href);
                })
                .catch(err => {
                  console.log("Couldn't read text", err);
                  reject("Failed");
                });
            } else {
              console.log("Fetch Failed");
              reject("Failed");
            }
          })
          .catch(err => {
            console.log("Couldn't fetch from api", err);
            reject("Failed");
          });
      });
    },
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
        // first, reset all the planCounts at that location
        const planIds = this.finalYAMLObject.locations[locationId].planIds;
        Object.keys(planIds).forEach(planKey => {
          if (this.finalYAMLObject.plans[planKey] && planIds[planKey]) {
            const locPlanCount = planIds[planKey];
            // add the cameras of this type back
            const newCount =
              this.finalYAMLObject.plans[planKey].camerasAssigned -
              locPlanCount;
            this.modifyPlan({
              planId: Number(planKey),
              field: "camerasAssigned",
              payload: newCount
            });
          }
        });
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
      // only add a default if it isn't already set.
      // if we wanted to change a value, we should call modify
      if (!this.defaults[payload.field]) {
        this.$set(this.defaults, payload.field, payload.value);
      }
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

      // Then, update the total number of cameras
      const newCameraCount = Object.keys(this.finalYAMLObject.plans)
        .map(planKey => {
          return this.finalYAMLObject.plans[planKey].numCameras;
        })
        .reduce((p, c) => p + c);
      console.log(newCameraCount);

      this.changeOverall({ key: "totalCameras", value: newCameraCount });
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
          // if the location is now empty, fill it with our dummy object
          if (Object.keys(planIdsCopy).length == 0) {
            planIdsCopy[1] = 1;
          }
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

        return propObject;
      }
      // Done case
      return;
    },
    resetToDefaults: function() {
      const data = initialState(this);
      Object.keys(data).forEach(key => (this[key] = data[key]));
      this.reloadComponents();
    },
    reloadComponents: function() {
      this.baseComponentsKey = Math.floor(Math.random() * 10000);
    },
    chooseColor: function(step) {
      // turn green if the user has passed this step and this step is not one the user is currently on
      if (
        step < this.progressionState.furthestStep &&
        step !== this.progressionState.onStep
      ) {
        return "secondary";
      } else {
        return "primary";
      }
    },
    setSlideAdvanceState(canAdvanceObj: {
      stepToChange: number;
      canAdvance: boolean;
    }): void {
      this.steps.forEach((step, index) => {
        if (step.stepId == canAdvanceObj.stepToChange) {
          this.$set(this.steps[index], "canAdvance", canAdvanceObj.canAdvance);
          this.steps[index].canAdvance;
        }
      });
    },
    // hideAllExceptFirst: function(currentStep) {
    //   return this.progressionState.furthestStep != 1 || currentStep == 1;
    // },
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

      const newPlanCount = Object.keys(planIds)
        .map(key => planIds[key])
        .reduce((p, c) => p + c);

      this.modifyLocation({
        index: locationKey,
        field: "planIds",
        payload: planIds
      });

      this.modifyLocation({
        index: locationKey,
        field: "numCameras",
        payload: newPlanCount
      });

      // "Unlock" the ability to move on to the next step
      this.setSlideAdvanceState({
        stepToChange: this.progressionState.locationStepId,
        canAdvance: true
      });
    },
    handleDefaultPlanCase(nextStep) {
      const plan = (this.getDefaultsForm.filter(
        form => form.fieldName !== "advancedOptions"
      ) as AccountForm[]).map(defaultField => {
        if (defaultField.fieldName == "addOns") {
          defaultField.selected = (defaultField.selected as any[]).map(
            (addonStrings: string) => {
              return {
                name: addonStrings,
                rate: 100
              } as AddOn;
            }
          );
          return defaultField;
        } else {
          return defaultField;
        }
      });

      plan.unshift({
        fieldName: "title",
        formType: "pure-component-textbox",
        isDefault: false,
        prompt: "Plan Name",
        subPrompt: "",
        selectionOpts: [""],
        selected: "Default Plan"
      });

      this.addPlan({
        resolutionsToHandle: [
          {
            title: this.defaults["resolution"],
            numCameras: this.finalYAMLObject.overall.totalCameras,
            cameraOpts: possibleOptions().resolution
          }
        ],
        plan
      });

      // "Unlock" the ability to move on to the next step
      this.setSlideAdvanceState({
        stepToChange: this.progressionState.planStepId,
        canAdvance: true
      });

      // check if we also need to add the plan to the location
      if (
        nextStep + 1 == this.progressionState.locationStepId &&
        this.finalYAMLObject.overall.totalLocations == 1
      ) {
        this.handleOneLocationCase();
      }
    },
    goToStep(nextStep) {
      // make sure step is in range
      if (nextStep >= 1 && nextStep <= this.progressionState.maxStep) {
        // if we are "sending quote", then don't run this logic, and send quote
        if (nextStep == this.progressionState.maxStep && !this.user.quoteSent) {
          this.sendQuote();
          return;
        }
        if (
          nextStep == this.progressionState.planStepId &&
          this.allDefaultsSet
        ) {
          this.handleDefaultPlanCase(nextStep);
        } else if (
          nextStep == this.progressionState.locationStepId &&
          this.finalYAMLObject.overall.totalLocations == 1
        ) {
          this.handleOneLocationCase();
        }

        // Change the max steps to match
        this.progressionState.maxStep = this.dynamicSlides.length;

        // Adjust second index to new max step
        this.stepperHiddenSlideIds[1] = this.progressionState.maxStep;

        // update the step we are on
        this.progressionState.onStep = nextStep;

        // set the furthest step
        this.progressionState.furthestStep = Math.max(
          this.progressionState.onStep,
          this.progressionState.furthestStep
        );
      }
    }
  }
});
</script>

<style scoped lang="scss">
::v-deep .v-main__wrap {
  display: flex;
  flex-direction: column;

  .app-title {
    padding-top: 30px;
    font-size: 35px;
    align-self: center;
    justify-content: center;
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  border: 3px solid #f7931e;
  border-radius: 20px;
  margin: 30px 10.3%;
  font-size: 16px !important;

  ::v-deep .v-label {
    font-weight: normal !important;
  }

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
    margin-left: 0px !important;
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
  }

  .app-content {
    padding: 0px 40px 40px 40px;

    @media only screen and (max-width: 650px) {
      padding: 40px;
    }
  }
}
</style>
