import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import BootstrapVue from "bootstrap-vue";
import firebase from "firebase";
import vuefire from "vuefire";
import VueToastr2 from "vue-toastr-2";
import "vue-toastr-2/dist/vue-toastr-2.min.css";
import VueCroppie from "vue-croppie";
import Chat from "vue-beautiful-chat";

window.toastr = require("toastr");

Vue.config.productionTip = false;

let app = "";

const config = {
  apiKey: "AIzaSyBZdod59nQfFcxzy9LAG8RD32YMqVXm7pU",
  authDomain: "chatbox-ver4.firebaseapp.com",
  databaseURL: "https://chatbox-ver4.firebaseio.com",
  projectId: "chatbox-ver4",
  storageBucket: "chatbox-ver4.appspot.com",
  messagingSenderId: "314618917702"
};

Vue.use(VueCroppie);
Vue.use(BootstrapVue);
Vue.use(vuefire);
Vue.use(VueToastr2);
Vue.use(Chat);

firebase.initializeApp(config);
const db = firebase.database();

firebase.auth().onAuthStateChanged(async fbuser => {
  await initApp(fbuser);
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      router,
      store,
      methods: {
        showError(message) {
          return this.$toastr.error(message, "Somthing went wrong !", {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-bottom-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "3000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
          });
        },
        showSuccess(message) {
          return this.$toastr.success(message, "operation success !", {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-bottom-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "3000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
          });
        },
        async signOut() {
          const contextMessenger = store.getters["contextMessenger"];
          const id = this.$store.getters["user/id"];
          if (contextMessenger && id) {
            db.ref("connectmessenger/" + id).remove();
          }
          firebase.auth().signOut();
          resetStore();
          return this.$router.push({ name: "Login" });
        }
      },
      watch: {
        user: function(val) {
          if (val && val.id) {
            const uid = this.$store.getters["user/uid"];
            userPresentUpdate(val.id, uid);
            const contextMessenger = store.getters["contextMessenger"];
            if (contextMessenger) {
              db.ref("connectmessenger/" + val.id).set(contextMessenger);
            }
          }
        }
      },
      computed: {
        user() {
          return this.$store.getters["user/user"];
        }
      },
      mounted() {
        const seft = this;
        window.extAsyncInit = function() {
          window.MessengerExtensions.getContext(
            "2229693873710059",
            function success(thread_context) {
              const id = seft.$store.getters["user/id"];
              if (id) {
                db.ref("connectmessenger/" + id).set(thread_context);
                seft.$store.commit("contextMessenger", thread_context);
              } else {
                seft.$store.commit("contextMessenger", thread_context);
              }
            }
          );
        };
      },
      created() {
        return (function(d, s, id) {
          var js,
            fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {
            return;
          }
          js = d.createElement(s);
          js.id = id;
          js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
          fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "Messenger");
      },
      render: h => h(App)
    }).$mount("#app");
  }
});

async function initApp(fbuser) {
  if (fbuser) {
    store.commit("user/fbuser", fbuser);
    store.commit("db", db);

    //add remote Function
    const remoteFun = firebase
      .app()
      .functions("asia-northeast1")
      .httpsCallable("remote");
    store.commit("remoteFun", remoteFun);

    store.commit("functions", firebase.app().functions("asia-northeast1"));
    /////////////////////
    const linking = await db.ref("linkid/" + fbuser.uid).once("value");
    const idUser = linking.val();
    if(!idUser){
      return;
    }

    const task = [
      db.ref("andanh/" + fbuser.uid).once("value"),
      db.ref("users/" + idUser).once("value")
    ];

    const result = await Promise.all(task);
    if (result[0].val()) {
      store.commit("chat/initandanh", result[0].val());
    }

    const userData = result[1].val();
    if (userData) {
      store.commit("user/user", userData);
      store.dispatch("chat/bindInbound", db.ref("inbound/" + userData.id));
    }

    // binding data
    store.dispatch("user/bindUser", db.ref("users/" + idUser));
    store.dispatch("chat/bindChatandanh", db.ref("andanh/" + fbuser.uid));
  } else {
    resetStore();
  }
}

function resetStore() {
  // reset vuex
  try {
    store.dispatch("user/unbindUser");
  } catch (error) {
    //console.log(error);
  }

  try {
    store.dispatch("chat/unbindChatandanh");
  } catch (error) {
    //console.log(error);
  }

  try {
    store.dispatch("chat/unbindInbound");
  } catch (error) {
    //console.log(error);
  }

  store.commit("RESET");
  store.commit("user/RESET");
  store.commit("chat/RESET");
  //////////////////////////
}

function userPresentUpdate(mssv, uid) {
  var isOfflineForDatabase = {
    state: "offline",
    last_changed: firebase.database.ServerValue.TIMESTAMP
  };

  var isOnlineForDatabase = {
    state: "online",
    last_changed: firebase.database.ServerValue.TIMESTAMP
  };

  var userStatusDatabaseRef1 = firebase.database().ref("/public/" + mssv);

  var userStatusDatabaseRef2 = firebase.database().ref("/public/" + uid);

  var userStatusDatabaseRef3 = firebase.database().ref("/status/" + uid);
  // Create a reference to the special '.info/connected' path in
  // Realtime Database. This path returns `true` when connected
  // and `false` when disconnected.

  var refConnected = firebase.database().ref(".info/connected");

  refConnected.off("value");

  refConnected.on("value", function(snapshot) {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() == false) {
      store.commit("disconnect", true);
      return;
    }
    store.commit("disconnect", false);
    // If we are currently connected, then use the 'onDisconnect()'
    // method to add a set which will only trigger once this
    // client has disconnected by closing the app,
    // losing internet, or any other means.

    userStatusDatabaseRef1
      .onDisconnect()
      .update(isOfflineForDatabase)
      .then(function() {
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect()
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
        userStatusDatabaseRef1.update(isOnlineForDatabase);
      });

    userStatusDatabaseRef2
      .onDisconnect()
      .update(isOfflineForDatabase)
      .then(function() {
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect()
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
        userStatusDatabaseRef2.update(isOnlineForDatabase);
      });

    userStatusDatabaseRef3
      .onDisconnect()
      .update(isOfflineForDatabase)
      .then(function() {
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect()
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
        userStatusDatabaseRef3.update(isOnlineForDatabase);
      });
  });
}

export default initApp;
