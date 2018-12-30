import Vue from "vue";
import Router from "vue-router";
import store from "./store";

import DefaultContainer from "./containers/DefaultContainer";

import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Conversation from "./views/chats/chatconversation";
import ChatRoom from "./views/chats/chatroom";
import ChatAnDanh from "./views/chats/chatandanh";
import Profile from "./views/chats/profile";
import Context from "./views/messenger/context";
import ConversationMessenger from "./views/messenger/conversation";
import SendMessage from "./views/chats/sendmessage";
import DiemThi from "./views/hoctap/diemthi";
import TaiLieu from "./views/hoctap/tailieu";

import Setting from "./views/other/setting";

import ErrorPage from "./views/auth/Page404";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/chatandanh",
      component: DefaultContainer,
      children: [
        {
          path: "conversation/:type/:messenger",
          name: "Conversation",
          component: Conversation
        },
        {
          path: "chatroom/:id",
          name: "ChatRoom",
          component: ChatRoom
        },
        {
          path: "chatandanh",
          name: "ChatAnDanh",
          component: ChatAnDanh
        },
        {
          path: "/profile/:id",
          name: "profile",
          component: Profile
        },
        {
          path: "/context/:id",
          name: "Context",
          component: Context
        },
        {
          path: "/messenger/conversation/:type",
          name: "Context",
          component: ConversationMessenger
        },
        {
          path: "/sendmessage",
          name: "SendMessage",
          component: SendMessage
        },
        {
          path: "/hoctap/diemthi",
          name: "DiemThi",
          component: DiemThi
        },
        {
          path: "/hoctap/tailieu",
          name: "TaiLieu",
          component: TaiLieu
        },
        {
          path: "/setting",
          name: "Setting",
          component: Setting
        }
      ]
    },
    {
      path: "/auth",
      name: "Auth",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "login",
          name: "Login",
          component: Login
        },
        {
          path: "register",
          name: "Register",
          component: Register
        },
        {
          path: "error",
          name: "Error",
          component: ErrorPage
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  let currentFirebase = store.getters["user/fbuser"];
  let user = store.getters["user/user"];

  if (to.name === "Error") {
    return next();
  }

  // da auth
  if (!currentFirebase && to.name != "Login") {
    if (to.name !== "Login" && to.name !== "Register") {
      store.commit("beforRedirect", to.path);
    }
    return next({ name: "Login" });
  } else if (!currentFirebase && to.name == "Login") {
    return next();
  } else if (!user && to.name !== "Register") {
    if (to.name !== "Login" && to.name !== "Register") {
      store.commit("beforRedirect", to.path);
    }
    return next({ name: "Register" });
  } else if (!user && to.name === "Register") {
    return next();
  } else {
    if (to.name === "Register" || to.name == "Login") {
      return next("/");
    }
    return next();
  }
});

export default router;
