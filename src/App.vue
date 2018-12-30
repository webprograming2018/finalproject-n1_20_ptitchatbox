<template>
  <router-view />
</template>

<script>
export default {
  name: "app"
};
</script>

<style lang="scss">
@import "~bootstrap-vue/dist/bootstrap-vue.css";
// Import Main styles for this application
@import "assets/scss/style";
.row{
  margin:0!important;
}
</style>
