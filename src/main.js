import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import { createProvider } from "./vue-apollo";
import router from "./router";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

new Vue({
  apolloProvider: createProvider(),
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
