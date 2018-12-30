import { firebaseMutations, firebaseAction } from "vuexfire";

const initState = {
  fbuser: null,
  user: null
};

export default {
  state: Object.assign({}, initState),
  mutations: {
    RESET(state) {
      for (let prop in initState) {
        state[prop] = initState[prop];
      }
    },
    fbuser(state, fbuser) {
      state.fbuser = fbuser;
    },
    user(state, user) {
      state.user = user;
    },
    ...firebaseMutations
  },
  actions: {
    bindUser: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef("user", ref);
    }),
    unbindUser: firebaseAction(({ unbindFirebaseRef }) => {
      unbindFirebaseRef("user");
    })
  },
  getters: {
    uid(state) {
      return state.fbuser ? state.fbuser.uid : null;
    },
    id(state) {
      return state.user ? state.user.id : null;
    },
    fbuser(state) {
      return state.fbuser;
    },
    user(state) {
      return state.user;
    }
  }
};
