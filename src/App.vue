<template>
  <v-app>
    <v-content>
      <router-link to="/">スレッド一覧</router-link>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App"
};
</script>
