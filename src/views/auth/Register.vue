<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="5">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <PulseLoader :loading="loading"></PulseLoader>
                <b-form v-if="!sessionCheckbox" @submit.prevent="connectQLDT()">
                  <h4>Kết nối với QLDT</h4>
                  <p class="text-muted">Để xác thực người dùng. App cần kết nối với QLDT</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text>
                        <i class="icon-user"></i>
                      </b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      type="text"
                      v-model="userName"
                      class="form-control"
                      placeholder="Username"
                      autocomplete="username email"
                    />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend>
                      <b-input-group-text>
                        <i class="icon-lock"></i>
                      </b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      type="password"
                      v-model="passWord"
                      class="form-control"
                      placeholder="Password"
                      autocomplete="current-password"
                    />
                  </b-input-group>
                  <b-form-checkbox-group class="sessionCheckbox">
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        v-model="sessionCheckbox"
                        id="customChk1"
                      >
                      <label class="custom-control-label" for="customChk1">Sử dụng session</label>
                    </div>
                  </b-form-checkbox-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button
                        type="submit"
                        :disabled="loading"
                        variant="primary"
                        class="px-4"
                      >Connect</b-button>
                    </b-col>
                    <b-col cols="6" class="text-right">
                      <b-button @click.prevent="signOut()" variant="link" class="px-0">Exit</b-button>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-alert
                      class="warning-error"
                      :show="dismissCountdown"
                      dismissible
                      variant="warning"
                      @dismissed="dismissCountdown = 0"
                    >{{ messageWarning }}</b-alert>
                  </b-row>
                </b-form>
                <b-form @submit.prevent="connectQLDT()" v-else>
                  <h4>Kết nối với QLDT</h4>
                  <p class="text-muted">Để xác thực người dùng. App cần kết nối với QLDT</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text>ASP.NET....</b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      type="text"
                      v-model="session"
                      class="form-control"
                      placeholder="Session"
                      autocomplete="username email"
                    />
                  </b-input-group>
                  <b-form-checkbox-group class="sessionCheckbox">
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        v-model="sessionCheckbox"
                        id="customChk1"
                      >
                      <label class="custom-control-label" for="customChk1">Sử dụng session</label>
                    </div>
                  </b-form-checkbox-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button
                        type="submit"
                        @click.prevent="connectQLDT()"
                        variant="primary"
                        :disabled="loading"
                        class="px-4"
                      >Connect</b-button>
                    </b-col>
                    <b-col cols="6" class="text-right">
                      <b-button @click.prevent="signOut()" variant="link" class="px-0">Exit</b-button>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-alert
                      class="warning-error"
                      :show="dismissCountdown"
                      dismissible
                      variant="warning"
                      @dismissed="dismissCountdown = 0"
                    >{{ messageWarning }}</b-alert>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<style scoped>
.warning-error {
  width: 100% !important;
  margin: 10px;
}
.sessionCheckbox {
  margin: 10px;
}
</style>

<script>
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import initApp from "@/main.js";

export default {
  components: {
    PulseLoader
  },
  methods: {
    connectQLDT: function() {
      if (this.sessionCheckbox && !this.session) {
        return this.showWarning("Vui lòng nhập vào phiên sử dụng.");
      } else if (!this.sessionCheckbox && (!this.userName || !this.passWord)) {
        return this.showWarning("Vui lòng điền tên đăng nhập và mật khẩu.");
      }
      this.loading = true;
      const connectQLDT = this.$store.state.functions.httpsCallable(
        "connectQLDT"
      );
      connectQLDT({
        username: this.userName,
        password: this.passWord,
        session: this.session
      }).then(async ({ data }) => {
        if (data.success) {
          const linking = await this.$store.state.db
            .ref("linkid/" + this.$store.getters["user/uid"])
            .once("value");

          const idUser = linking.val();

          // Khi register xong thi phai khoi dong binding lai app
          initApp(this.$store.getters["user/fbuser"]);

          if (!idUser) {
            return this.$router.push({
              name: "Error",
              query:{
                error:"idUser không tồn tại sau khi linking"
              } 
            });
          } else {
            const data = await this.$store.state.db
              .ref("users/" + idUser)
              .once("value");
            if (data.val()) {
              this.$store.commit("user/user", data.val());
              if (this.$store.getters["redirect"]) {
                return this.$router.push({
                  path: this.$store.getters["redirect"]
                });
              }
              return this.$router.push({ path: "/chatandanh" });
            }
          }

        } else {
          this.loading = false;
          this.showWarning(data.error);
        }
      });
    },
    showWarning(error, time) {
      this.messageWarning = error;
      if (time) {
        this.dismissCountdown = time;
      } else {
        this.dismissCountdown = 5;
      }
    },
    async signOut() {
      return this.$root.signOut();
    }
  },
  data: () => {
    return {
      sessionCheckbox: false,
      loading: false,
      dismissCountdown: 0,
      messageWarning: "",
      userName: null,
      passWord: null,
      session: null
    };
  },
  name: "Login"
};
</script>
