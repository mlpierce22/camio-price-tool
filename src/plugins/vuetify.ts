import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify, {
  theme: {
    themes: {
      light: {
        primary: "#f7931e",
        secondary: "#50B536",
        error: "#FF0000"
      }
    }
  }
});

export default new Vuetify({});
