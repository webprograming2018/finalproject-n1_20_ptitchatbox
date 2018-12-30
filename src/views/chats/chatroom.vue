<template>
  <beautiful-chat
    :participants="participants"
    :titleImageUrl="titleImageUrl"
    :onMessageWasSent="onMessageWasSent"
    :messageList="getMessageListAll"
    :newMessagesCount="newMessagesCount"
    :isOpen="isChatOpen"
    :close="closeChat"
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
    v-if="titleImageUrl&&conversation_info"
    canReply
  />
</template>


<style>
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
import firebase from "firebase";

const vm = {
  data() {
    return {
      showLoadMessage: false,
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
      conversation_id: "",
      conversation_info: null,
      room: null,
      member: null,
      checkBindPublicInfo: {},
      watchPublicInfo: null,
      moreMessage: []
    };
  },
  computed: {
    getMessageListAll() {
      const result = [];
      const tmp = [...this.moreMessage, ...this.messageList];
      for(let element of tmp){
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
            debugger;
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
    }
  },
  async created() {
    this.conversation_id = this.$route.params.id;

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
  methods: {
    async uploadFile(file) {
      let fileSnapshot = null;
      try {
        const userid = this.$store.getters["user/id"];
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
    room: function(val) {
      if (!val) {
        return;
      }
      if (Object.keys(val).length == 0) return;

      this.getAllDataConversation();
    },
    member: function(val) {
      if (!val) {
        return;
      }
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
      if (!val) {
        return;
      }
      if (Object.keys(val).length == 0) return;

      //handle participants

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
    "$route.params.id": async function(val) {
      this.conversation_id = val;
      this.participants = [];
      this.conversation_info = null;
      this.checkBindPublicInfo = {};
      this.isFinalMessage = false;
      this.showLoadMessage = false;

      this.$unbind("room");
      this.$unbind("member");
      this.$unbind("watchPublicInfo");
      this.$unbind("messageList");

      const seft = this;
      setTimeout(() => {
        seft.$bindAsArray(
          "messageList",
          seft.$store.state.db
            .ref("messages/" + seft.conversation_id)
            .limitToLast(20)
        );

        seft.$bindAsObject(
          "room",
          seft.$store.state.db.ref("room_names/" + this.conversation_id)
        );
        seft.$bindAsObject(
          "member",
          seft.$store.state.db.ref("members/" + this.conversation_id)
        );
      }, 0);
    }
  }
};

export default vm;
</script>

