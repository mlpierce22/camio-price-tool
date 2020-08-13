<template>
  <v-app>
    <v-main>
      <div class="app-container">
        <TheQuoteIntroPage
          v-if="formProgressionState.onStep === 0"
          :formData="quoteIntroPageFormData"
        />
        <!-- Otherwise: stepper -->
        <div class="seperator"></div>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import TheQuoteIntroPage from "@/components/TheQuoteIntroPage.vue";
import { QuoteIntroForm } from "@/models";

export default Vue.extend({
  components: {
    TheQuoteIntroPage
  },

  data: () => ({
    formProgressionState: {
      furthestStep: 0, // Options for steps 0 (intro), 1 (account), 2 (plans), 3 (locations), 4 (done)
      onStep: 0,
      showLocations: true
    },
    quoteIntroPageFormData: {
      numCameras: {
        prompt: "How many cameras do you have?",
        units: "Camera",
        initVal: 10
      },
      numLANLocations: {
        prompt: "Across how many LAN locations are your cameras located?",
        units: "Location",
        initVal: 1
      }
    } as QuoteIntroForm,
    accountPageFormData: {},
    createPlansPageFormData: {},
    addLocationsPageFormData: {}
  }),
  methods: {}
});
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  border: 3px solid #f7931e;
  border-radius: 20px;
  margin: 30px 10.3%;
  padding: 40px 100px;

  .seperator {
    border: 3px solid #f7931e;
    height: 3px;
    margin: -100px;
    width: 100%;
  }
}
</style>
