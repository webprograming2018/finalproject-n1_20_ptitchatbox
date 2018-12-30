<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">500</h1>
            <h4 class="pt-3">Oops! Có gì đó sai.</h4>
            <p class="text-muted">{{error}}</p>
          </div>
          <b-input-group>
            <b-input-group-append>
              <b-button variant="info" @click="goHome()">Quay lại trang chủ</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "Page404",
  data() {
    return {
      error: "The page you are looking for was not found."
    };
  },
  created() {
    this.error = this.$route.query.error;
  },
  methods: {
    goHome(){
      return this.$router.push({path:"/"});
    }
  },
};
</script>
