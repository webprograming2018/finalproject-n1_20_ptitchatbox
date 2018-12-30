import { firebaseMutations, firebaseAction } from "vuexfire";

const initState = {
  chatandanh: null,
  inbound: null,
  initandanh: null
};

export default {
  state: Object.assign({}, initState),
  mutations: {
    RESET(state) {
      for (let prop in initState) {
        state[prop] = initState[prop];
      }
    },
    initandanh(state, value) {
      state.initandanh = value;
    },
    ...firebaseMutations
  },
  actions: {
    bindChatandanh: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef("chatandanh", ref);
    }),
    bindInbound: firebaseAction(({ bindFirebaseRef }, ref) => {
      bindFirebaseRef("inbound", ref);
    }),
    unbindChatandanh: firebaseAction(({ unbindFirebaseRef }) => {
      unbindFirebaseRef("chatandanh");
    }),
    unbindInbound: firebaseAction(({ unbindFirebaseRef }) => {
      unbindFirebaseRef("inbound");
    })
  },
  getters: {
    chatandanh(state){
      return state.chatandanh;
    }
  }
};
