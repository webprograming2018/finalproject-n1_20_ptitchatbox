<template>
  <beautiful-chat
    :participants="participants"
    :titleImageUrl="titleImageUrl"
    :onMessageWasSent="onMessageWasSent"
    :messageList="getMessageListAll"
    :newMessagesCount="newMessagesCount"
    :isOpen="isChatOpen"
    :close="onClose"
    :open="openChat"
    :showEmoji="true"
    :showFile="true"
    :showTypingIndicator="showTypingIndicator"
    :colors="colors"
    :title="title"
    :alwaysScrollToBottom="alwaysScrollToBottom"
    :me="getMe"
    :showLoadMessage="showLoadMessage"
    :uploadFile="uploadFile"
    :conversation_info="conversation_info"
    :user_info="getUserInfoComp"
    :loadNewMessage="loadNewMessage"
    closeBtn
    andanh
    :canReply="canReply"
    :onSave="onSave"
    :showWaringSaveConversation="showWaringSaveConversation"
    v-if="isAnDanh && conversation_info"
  />
  <div
    v-else
    style="flex-grow: 999;display:flex; flex-direction: column;align-items: center;background-color:#f4f4f4"
  >
    <div class="blank-screen">
      <span class="blank-screen-title">
        <strong>Chào các bạn đến với PTIT Chatbox!</strong>
      </span>
      <h5
        style="font-size:13px;color: #1d2129;line-height: 19px;"
      >Bạn chat sẽ thấy được các thông tin bạn cài đặt trong private Profile.</h5>
      <h5 style="font-size:13px;color: #1d2129;">Mẹo: Click
        <router-link :to="{ name: 'profile', params: { id: 'private' } }">vào đây</router-link>để thay đổi avatar,nickname,cover...
      </h5>
      <!--<span>Kiểm tra lại thông tin của bạn mà bạn chat sẽ thấy <a href="#" @click="active=!active"> tại đây</a>.</span>-->
      <h4
        style="color:green;font-size:20px;margin-top:30px;"
        v-if="this.$store.getters['user/user'].mssv === 'B14DCCN762'"
      >
        Có {{ metadata.queue || 0 }} người đang trong hàng chờ trên tổng số
        {{ getTotalOnline }} đang online.
      </h4>
    </div>
    <div style="margin-top:40px;">
      <b-btn v-if="!isSeaching" variant="outline-success" block @click="activeSearchFriend()">
        <i class="fas fa-search"></i> Tìm bạn
      </b-btn>
      <b-btn v-else variant="outline-danger" block @click="cancleSearchFriend()">
        <i class="fas fa-ban"></i> Hủy
      </b-btn>
    </div>
    <PulseLoader v-if="isSeaching" style="margin-top:10%;" :loading="loading"></PulseLoader>
  </div>
</template>

<style>
.blank-screen {
  margin-top: 5%;
  text-align: center;
  padding: 10px;
}
.blank-screen-title {
  display: block;
  color: #00a1f2;
  font-size: 32px;
  margin-bottom: 20px;
}

.sc-chat-window .navbar-toggler-icon {
  height: 23px;
  background-image: url(http://waverleystudiocollege.co.uk/wp-content/uploads/2015/11/Custom-Icon-Design-Mono-General-1-Information.ico);
}
.sc-header--img {
  height: 60px !important;
  width: 60px !important;
}
</style>

<script>
import { setTimeout } from "timers";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import firebase from "firebase";
const vm = {
  components: {
    PulseLoader
  },
  data() {
    return {
      loading: true,
      showLoadMessage: false,
      me: null,
      title: "",
      participants: [],
      titleImageUrl: null,
      messageList: [], // the list of the messages to show, can be paginated and adjusted dynamically
      newMessagesCount: 0,
      isChatOpen: true, // to determine whether the chat window should be open or closed
      showTypingIndicator: "", // when set to a value matching the participant.id it shows the typing indicator for the specific user
      colors: {
        header: {
          bg: "#4e8cff",
          text: "#ffffff"
        },
        launcher: {
          bg: "#4e8cff"
        },
        messageList: {
          bg: "#ffffff"
        },
        sentMessage: {
          bg: "#4e8cff",
          text: "#ffffff"
        },
        receivedMessage: {
          bg: "#eaeaea",
          text: "#222222"
        },
        userInput: {
          bg: "#f4f7f9",
          text: "#565867"
        },
        timestampCheck: "",
        isFinalMessage: false
      }, // specifies the color scheme for the component
      alwaysScrollToBottom: true, // when set to true always scrolls the chat to the bottom when new events are in (new message, user starts typing...)
      conversation_info: null,
      room: null,
      member: null,
      checkBindPublicInfo: {},
      watchPublicInfo: null,
      unbinding: false,
      metadata: {
        queue: 0
      },
      moreMessage: [],
      showWaringSaveConversation: false
    };
  },
  computed: {
    getMessageListAll() {
      const result = [];
      const tmp = [...this.moreMessage, ...this.messageList];
      debugger
      for (let element of tmp) {
        if (
          element.type == "system" &&
          element.action &&
          element.action.user &&
          element.action.user === this.getMe
        ) {
          continue;
        }
        if (
          !result.find(item => {
            item[".key"] === element[".key"];
          })
        ) {
          result.push(element);
        }
      }
      result.sort((a, b) => {
        a.timestamp - b.timestamp;
      });
      return result;
    },
    isSeach() {
      return this.$store.getters["chat/chatandanh"].isSearch || false;
    },
    isAnDanh() {
      const chatandanh = this.$store.getters["chat/chatandanh"];
      if (!chatandanh) return false;
      if (chatandanh && !chatandanh.conversation_id) return false;
      if (chatandanh && chatandanh.conversation_id && this.isSeach)
        return false;
      return true;
    },
    isSeaching() {
      const chatandanh = this.$store.getters["chat/chatandanh"];
      if (chatandanh && chatandanh.isSearch) {
        return true;
      } else {
        return false;
      }
    },
    canReply() {
      if (this.room && this.room.isClose) {
        return false;
      } else {
        return true;
      }
    },
    getUserInfoComp() {
      return this.$store.getters["user/user"];
    },
    getMe() {
      if (!this.room) {
        return "";
      }
      if (this.room.public) {
        return this.$store.getters["user/id"];
      } else {
        return this.$store.getters["user/uid"];
      }
    },
    conversation_id() {
      const chatandanh = this.$store.getters["chat/chatandanh"];
      if (chatandanh && chatandanh.conversation_id) {
        return chatandanh.conversation_id;
      } else {
        return "";
      }
    },
    getTotalOnline() {
      return this.$store.state.totalOnlone;
    }
  },
  async created() {
    this.$bindAsObject("metadata", this.$store.state.db.ref("metadata"));

    if (!this.conversation_id) {
      return;
    }
    this.initChatAnDanh();
  },
  methods: {
    resetData() {
      this.me = null;
      this.title = "";
      this.participants = [];
      this.titleImageUrl = null;
      this.messageList = [];
      this.newMessagesCount = 0;
      this.isChatOpen = true;
      this.conversation_info = null;
      this.room = null;
      this.member = null;
      this.checkBindPublicInfo = {};
      this.watchPublicInfo = null;
    },
    async onSave() {
      const remote = this.$store.state.functions.httpsCallable("remote");
      try {
        const { data } = await remote({
          type: "saveconversation"
        });
        if (data.error) {
          return this.$root.showError(data.error);
        }
      } catch (error) {
        return this.$root.showError(error);
      }
    },
    async initChatAnDanh() {
      if (!this.conversation_id) {
        return;
      }

      if (this.unbinding) {
        this.$unbind("room");
        this.$unbind("member");
        this.$unbind("watchPublicInfo");
        this.$unbind("messageList");
        this.unbinding = false;
      }

      this.$bindAsArray(
        "messageList",
        this.$store.state.db
          .ref("messages/" + this.conversation_id)
          .limitToLast(20)
      );

      this.$bindAsObject(
        "room",
        this.$store.state.db.ref("room_names/" + this.conversation_id)
      );
      this.$bindAsObject(
        "member",
        this.$store.state.db.ref("members/" + this.conversation_id)
      );
    },
    async cancleSearchFriend() {
      const db = this.$store.state.db;

      try {
        await db.ref("andanh/" + this.$store.getters["user/uid"]).update({
          isSearch: false
        });
      } catch (error) {
        this.$root.showError(error.toString());
      }
    },
    async activeSearchFriend() {
      const db = this.$store.state.db;
      const uid = this.$store.getters["user/uid"];
      const nick_name = await db
        .ref("public/" + uid + "/nick_name")
        .once("value");
      if (!nick_name.val()) {
        this.$root.showError("Bạn chưa thay đổi nick_name sau khi đăng kí.");
      }
      try {
        await db.ref("andanh/" + this.$store.getters["user/uid"]).update({
          isSearch: true,
          time: firebase.database.ServerValue.TIMESTAMP
        });
      } catch (error) {
        this.$root.showError(error.toString());
      }
    },
    async onClose(isExit) {
      const db = this.$store.state.db;
      if (isExit) {
        try {
          await db.ref("andanh/" + this.$store.getters["user/uid"]).update({
            isSearch: true,
            time: firebase.database.ServerValue.TIMESTAMP
          });
        } catch (error) {
          this.$root.showError(error.toString());
        }
        this.resetData();
      }
      try {
        await db.ref("room_names/" + this.conversation_id).update({
          isClose: true,
          closer: this.$store.getters["user/id"]
        });
      } catch (error) {
        this.$root.showError(error.toString());
      }
    },
    async uploadFile(file) {
      let fileSnapshot = null;
      try {
        const userid = this.$store.getters["user/user"].id;
        fileSnapshot = await firebase
          .storage()
          .ref(
            "/files/" +
              userid +
              "/" +
              Math.random()
                .toString(36)
                .substring(2) +
              file.name
          )
          .put(file);
        const file_url = await fileSnapshot.ref.getDownloadURL();
        return file_url;
      } catch (ex) {
        this.$root.showError(ex.toString());
        return null;
      }
    },
    async sendMessage(text) {
      if (text.length > 0) {
        this.newMessagesCount = this.isChatOpen
          ? this.newMessagesCount
          : this.newMessagesCount + 1;

        this.onMessageWasSent({
          author: "support",
          type: "text",
          data: { text }
        });
      }
    },
    async onMessageWasSent(message) {
      // called when the user sends a message
      const db = this.$store.state.db;
      const task = [];
      task[0] = db.ref("messages/" + this.conversation_id).push({
        ...message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      task[1] = db.ref("room_names/" + this.conversation_id).update({
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      try {
        await Promise.all(task);
      } catch (ex) {
        this.$root.showError(String(ex));
      }
    },
    openChat() {
      // called when the user clicks on the fab button to open the chat
      this.isChatOpen = true;
      this.newMessagesCount = 0;
    },
    closeChat() {
      // called when the user clicks on the botton to close the chat
      this.isChatOpen = false;
    },
    async getAllDataConversation() {
      // chi chay kh this.participants de merge het va room duoc load

      for (let member of this.participants) {
        if (!member.merge) return;
      }

      if (
        Object.keys(this.room).length == 0 ||
        !this.conversation_id ||
        this.participants.length == 0
      ) {
        return;
      }

      const room = this.room;
      const member = this.participants;

      const name_conversation = this.getNameConversation(
        room,
        member,
        this.getMe
      );
      const avatar_conversation = this.getAvatarConversation(
        room,
        member,
        this.getMe
      );

      this.conversation_info = {
        ...room,
        id: this.conversation_id,
        name: name_conversation
      };

      if (!avatar_conversation) {
        return this.$root.showError(
          "Error init conversation at function getAllDataConversation"
        );
      }

      this.title = name_conversation;
      this.titleImageUrl = avatar_conversation;
    },
    getNameConversation(room, members, me) {
      debugger;
      if (room.name) {
        return room.name;
      } else if (room.type == "friend") {
        for (let member of members) {
          if (member.id != me) {
            return member.name;
          }
        }
        return null;
      }
    },
    getAvatarConversation(room, members, me) {
      if (room.avatar) {
        return room.avatar;
      } else if (room.type == "friend") {
        for (let member of members) {
          if (member.id != me) {
            return member.avatar;
          }
        }
        return "/img/default-avatar.png";
      } else if (room.type == "group") {
        //default avatar
        return "/img/default-group.png";
      }
    },
    handlePublicInfo(id, info) {
      // xu ly state , name , avatar , cover avatar
      const obj = {};
      obj["id"] = id;
      obj["name"] = info["full_name"] || info["nick_name"] || "Sinh viên ptit";
      obj["state"] =
        info["state"] && info["state"] == "online" ? "online" : "offline";
      obj["avatar"] = info["avatar"] || "/img/default-avatar.png";
      obj["cover"] =
        info["cover"] || "https://source.unsplash.com/random/700x300";

      return obj;
    },
    handlePrivateInfo(id, info) {
      const obj = {};
      obj["id"] = id;
      if (info.basicinfo && info.basicinfo.ten_sv) {
        obj["name"] = info.basicinfo.ten_sv;
        obj["checkName"] = true;
      }
      return {
        ...info,
        ...obj
      };
    },
    async loadNewMessage() {
      /*this.$bindAsArray(
          "messageList",
          this.$store.state.db
            .ref("messages/" + this.conversation_id)
            .limitToLast(this.messageList.length + 5)
        );*/
      if (this.isFinalMessage || this.showLoadMessage) {
        return;
      }
      this.showLoadMessage = true;
      this.alwaysScrollToBottom = false;
      const db = this.$store.state.db;
      const timestamp = this.getMessageListAll[0]
        ? this.getMessageListAll[0].timestamp
        : 1;

      const lasterDate = new Date().getTime();
      const data = await db
        .ref("messages/" + this.conversation_id)
        .orderByChild("timestamp")
        .endAt(timestamp - 1)
        .limitToLast(5)
        .once("value");
      const newMessage = data.val();

      const now = new Date().getTime();

      if (now - lasterDate < 1000) {
        await new Promise(resolve => {
          setTimeout(() => {
            return resolve();
          }, 1000 - (now - lasterDate));
        });
      }

      if (!newMessage) {
        this.moreMessage = [
          {
            id: "stystem-message-finnalmessage",
            type: "system",
            author: "system",
            data: {
              text: "Hết tin nhắn"
            }
          },
          ...this.moreMessage
        ];
        this.isFinalMessage = true;
        this.showLoadMessage = false;
      }

      const arrMessage = [];
      for (let i in newMessage) {
        const obj = { ...newMessage[i] };
        obj[".key"] = i;
        arrMessage.push(obj);
      }
      arrMessage.sort((a, b) => {
        a.timestamp - b.timestamp;
      });

      this.moreMessage = [...arrMessage, ...this.moreMessage];
      this.showLoadMessage = false;
      this.alwaysScrollToBottom = true;
    },
    handleScroll(event) {
      if (event.srcElement.scrollTop === 0) {
        this.loadNewMessage();
        // load message
      }
    }
  },
  watch: {
    room: function(val, oldval) {
      if (Object.keys(val).length == 0) return;
      debugger;
      if (
        val &&
        oldval &&
        Object.keys(oldval).length !== 0 &&
        val.savepending &&
        !oldval.savepending &&
        Object.keys(val.savepending).length === 1 &&
        !val.savepending[this.getMe]
      ) {
        //watch warning save conversation
        this.showWaringSaveConversation = true;
      } else {
        this.showWaringSaveConversation = false;
      }

      if (
        val.savepending &&
        oldval.savepending &&
        Object.keys(val.savepending).length === 2
      ) {
        let f = "";
        for (let i in val.savepending) {
          if (i !== this.getMe) {
            f = i;
            break;
          }
        }
        if (val.savepending[f] === false && oldval.savepending[f] !== false) {
          this.$root.showError("Người kia từ chối yêu cầu của bạn");
        }
      }
      if (
        val &&
        oldval &&
        val.isSave === true &&
        Object.keys(oldval).length > 0 &&
        oldval.isSave === undefined
      ) {
        return this.$root.showSuccess(
          "Cuộc trò chuyện được lưu vào mục Bạn bè"
        );
      }

      //debugger
      this.getAllDataConversation();
    },
    member: function(val) {
      if (Object.keys(val).length == 0) return;

      const member = { ...val };
      //const conversation_id = member['.key'];
      delete member[".key"];
      for (let id in member) {
        if (!this.checkBindPublicInfo[id]) {
          const seft = this;
          setTimeout(() => {
            seft.$bindAsObject(
              "watchPublicInfo",
              seft.$store.state.db.ref("public/" + id)
            );
          }, 0);

          this.checkBindPublicInfo[id] = true;
        }
      }

      //handle participants
      const _tmp = [...this.participants];

      for (let i in member) {
        const privateInfo = this.handlePrivateInfo(i, member[i]);
        let check = true;
        for (let j in _tmp) {
          if (privateInfo.id === _tmp[j].id) {
            check = false;

            _tmp[j] = { ..._tmp[j], ...privateInfo, merge: true };
            break;
          }
        }
        if (check) {
          _tmp.push(privateInfo);
        }
      }

      this.participants = _tmp;

      this.getAllDataConversation();
    },
    watchPublicInfo: function(val) {
      if (Object.keys(val).length == 0) return;

      //handle participants
      debugger;
      const _tmp = [...this.participants];
      const key = val[".key"];
      const publicInfo = this.handlePublicInfo(key, val);

      let check = true;
      for (let i in _tmp) {
        if (_tmp[i].id == key) {
          check = false;

          // check uu tien
          if (_tmp[i].checkName) {
            delete publicInfo["name"];
          }

          _tmp[i] = { ..._tmp[i], ...publicInfo, merge: true };
        }
      }
      if (check) {
        _tmp.push(publicInfo);
      }
      this.participants = _tmp;

      this.getAllDataConversation();
    },
    conversation_id: function(val, oldval) {
      if (val && oldval) {
        this.unbinding = true;
        this.participants = [];
        this.checkBindPublicInfo = {};
      }
      this.initChatAnDanh();
    }
  }
};

export default vm;
</script>
