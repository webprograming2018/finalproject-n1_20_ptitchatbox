<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <PulseLoader :loading="loading"></PulseLoader>
                <b-form v-show="!isSendEMS">
                  <h1>Đăng nhập</h1>
                  <b-button @click.prevent="loginFb()">Login Fb</b-button>

                  <p class="text-muted">Đăng nhập bằng số điện thoại...</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text>+84</b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      type="text"
                      class="form-control"
                      placeholder="Số điện thoại..."
                      v-model="phoneNumber"
                    />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button
                        type="submit"
                        @click.prevent="loading = true"
                        :disabled="loading"
                        id="get-sign-in-code"
                        variant="primary"
                        class="px-4"
                        >Login</b-button
                      >
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-alert
                      class="warning-error"
                      :show="dismissCountdown"
                      dismissible
                      variant="warning"
                      @dismissed="dismissCountdown = 0"
                      >{{ messageWarning }}</b-alert
                    >
                  </b-row>
                </b-form>
                <b-form v-show="isSendEMS">
                  <h1>Xác thực đăng nhập</h1>
                  <p class="text-muted">
                    Chúng tôi sử dụng dịch vụ của <strong>Google</strong> để gửi
                    một mã xác thực tới SĐT: {{ phoneNumber }}
                  </p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text>Code</b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      type="text"
                      class="form-control"
                      placeholder="Mã xác thực..."
                      v-model="code"
                    />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button
                        type="submit"
                        @click.prevent="signIn()"
                        :disabled="loading"
                        variant="primary"
                        class="px-4"
                        >Verify</b-button
                      >
                    </b-col>
                    <b-col cols="6" class="text-right">
                      <b-button
                        @click.prevent="isSendEMS = false"
                        variant="link"
                        class="px-0"
                        >Gửi lại</b-button
                      >
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-alert
                      class="warning-error"
                      :show="dismissCountdown"
                      dismissible
                      variant="warning"
                      @dismissed="dismissCountdown = 0"
                      >{{ messageWarning }}</b-alert
                    >
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
<style lang="scss" scoped>
.warning-error {
  width: 100% !important;
  margin: 10px;
}
</style>

<script>
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import firebase from "firebase";

export default {
  components: {
    PulseLoader
  },
  name: "Login",
  data() {
    return {
      loading: false,
      size: "15px",
      phoneNumber: null,
      recaptchaVerifier: null,
      code: null,
      messageWarning: "",
      dismissCountdown: 0,
      isSendEMS: false
    };
  },
  computed: {
    getPhoneNumber: function() {
      if (this.phoneNumber[0] == "0") {
        return "+84" + this.phoneNumber.slice(1);
      } else {
        return "+84" + this.phoneNumber;
      }
    }
  },
  methods: {
    loginFb() {
      const provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope("user_birthday");
      firebase.auth().languageCode = "vi";
      provider.setCustomParameters({
        display: "popup"
      });
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          const token = result.credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // ...
          debugger;
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          debugger;
          // ...
        });
    },
    sendSMSCode: async function() {
      const appVerifier = window.recaptchaVerifier;
      try {
        window.confirmationResult = await firebase
          .auth()
          .signInWithPhoneNumber(this.getPhoneNumber, appVerifier);
        this.isSendEMS = true;
      } catch (error) {
        this.isSendEMS = false;
        this.showWarning(error.code);
      }

      this.loading = false;
    },
    signIn: async function() {
      this.loading = true;
      try {
        const r = await window.confirmationResult.confirm(this.code);

        this.$store.commit("user/fbuser", r.user);

        const linking = await this.$store.state.db
          .ref("linkid/" + r.user.uid)
          .once("value");

        const idUser = linking.val();

        if (!idUser) {
          return this.$router.push({ name: "Register" });
        } else {
          const data = await this.$store.state.db
            .ref("users/" + idUser)
            .once("value");

          //debugger;
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
      } catch (error) {
        this.loading = false;
        this.showWarning(error.code);
      }
    },
    showWarning(error, time) {
      this.messageWarning = error;
      if (time) {
        this.dismissCountdown = time;
      } else {
        this.dismissCountdown = 5;
      }
    }
  },
  async mounted() {
    const self = this;

    //firebase.auth().settings.appVerificationDisabledForTesting = true;

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "get-sign-in-code",
      {
        size: "invisible",
        callback: () => {
          return self.sendSMSCode();
        }
      }
    );
    try {
      window.recaptchaWidgetId = await window.recaptchaVerifier.render();
    } catch (error) {
      this.loading = true;
      this.showWarning(error.code, 500);
    }
  }
};
</script>
