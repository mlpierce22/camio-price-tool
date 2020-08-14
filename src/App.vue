<template>
  <v-app>
    <v-main>
      <div class="app-container">
        <TheQuoteIntroPage
          v-if="formProgressionState.onStep === 0"
          :formData="quoteIntroPageFormData"
          @new-value-keyed="updateQuotePageVals($event)"
        />
        <!-- Otherwise: stepper -->

        <div class="seperator"></div>

        <!-- <VNextBackButton :buttonsConfig="" @nextStep="" /> -->
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TheQuoteIntroPage from "@/components/TheQuoteIntroPage.vue";
import VNextBackButton from "@/components/shared/VBackNextButton.vue";
import { QuoteIntroForm, BackNextButtonConfig } from "@/models";

export default Vue.extend({
  components: {
    // VNextBackButton,
    TheQuoteIntroPage
  },

  data: () => ({
    formProgressionState: {
      furthestStep: 0, // Options for steps 0 (intro), 1 (account), 2 (plans), 3 (locations), 4 (done)
      onStep: 0,
      maxStep: 4,
      showLocations: true
    },
    // initButtonConfig: {
    //   nextText: "Account-wide",
    //   backText: "Back",
    //   showBack: false,
    //   showNext: true
    // } as BackNextButtonConfig,
    quoteIntroPageFormData: {
      numCameras: {
        prompt: "How many cameras do you have?",
        units: "Camera",
        value: 10
      },
      numLANLocations: {
        prompt: "Across how many LAN locations are your cameras located?",
        units: "Location",
        value: 1
      }
    } as QuoteIntroForm,
    accountPageFormData: {},
    createPlansPageFormData: {},
    addLocationsPageFormData: {}
  }),
  methods: {
    updateQuotePageVals: function(newValObj) {
      const castVal = parseInt(newValObj.newVal, 10);
      this.quoteIntroPageFormData[newValObj.key].value = castVal;
    }
    // updateButtonConfig: function(step) {
    //   switch (step) {
    //     case 0:
    //       return {
    //         nextText: "Account-wide",
    //         backText: "Back to Intro",
    //         showBack: false,
    //         showNext: true
    //       };
    //     case 1:
    //       return {
    //         nextText: "Create Plans",
    //         backText: "Back to Account",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 2:
    //       return {
    //         nextText: this.formProgressionState.maxStep == 4 ? "Add Locations",
    //         backText: "Back to Plans",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 3 && this.formProgressionState.maxStep == 4:
    //       // then location
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: true,
    //         showNext: true
    //       };
    //     case 3 && this.formProgressionState.maxStep == 3:
    //       // then done
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: false,
    //         showNext: false
    //       };
    //     case 4:
    //       // then done
    //       return {
    //         nextText: "Next",
    //         backText: "Back",
    //         showBack: false,
    //         showNext: false
    //       };
    //   }
    //   if (step === 0) {
    //     this.initButtonConfig;
    //   }
    //   e;
    //   if (step === this.formProgressionState.maxStep) {
    //   }
    // },
    // nextStep: function() {
    //   this.formProgressionState.onStep++;
    // },
    // prevStep: function() {
    //   this.formProgressionState.onStep--;
    // }
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
  padding: 40px 40px 40px 100px;
  align-items: center;

  @media only screen and (max-width: 600px) {
    padding: 40px;
  }

  .seperator {
    border: 3px solid #f7931e;
    height: 3px;
    //margin: -100px;
    width: 100%;
  }
}
</style>
