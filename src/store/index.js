import Vue from "vue";
import Vuex from "vuex";
import userModule from "./user";
import chatModule from "./chat";
import { firebaseMutations, firebaseAction } from "vuexfire";

Vue.use(Vuex);

const initState = {
  remoteFun: null,
  db: null,
  functions: null,
  redirect:null,
  disconnect:false,
  contextMessenger:null,
  messaging:null
};

export default new Vuex.Store({
  modules: {
    user: {
      namespaced: true,
      ...userModule
    },
    chat: {
      namespaced: true,
      ...chatModule
    }
  },
  state: Object.assign({}, initState),
  mutations: {
    RESET(state) {
      for (let prop in initState) {
        state[prop] = initState[prop];
      }
    },
    remoteFun(state, remote) {
      state.remoteFun = remote;
    },
    messaging(state, messaging) {
      state.messaging = messaging;
    },
    db(state, db) {
      state.db = db;
    },
    functions(state, functions) {
      state.functions = functions;
    },
    beforRedirect(state,name){
      state.redirect = name;
    },
    disconnect(state,value){
      state.disconnect = value;
    },
    contextMessenger(state,value){
      state.contextMessenger = value;
    },
    ...firebaseMutations
  },
  actions: {

  },
  getters: {
    messaging(state){
      return state.messaging;
    },
    redirect(state){
      return state.redirect;
    },
    contextMessenger(state){
      return state.contextMessenger;
    },
  }
});
