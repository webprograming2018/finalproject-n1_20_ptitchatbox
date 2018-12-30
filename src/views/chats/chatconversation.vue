<template>
  <div class="container-conversation">
    <div class="item-header">
      <div style="position:relative">
        <h3>Tin nhắn</h3>
        <h6 v-if="messenger == 'messenger'">Chọn cuộc trò chuyện để chuyển tiếp nó vào messenger</h6>
      </div>
    </div>

    <div v-for="item of getConversations" v-bind:key="item.id" class="item">
      <router-link
        tag="a"
        :to="{ name: 'ChatRoom', params: { id: item.id } }"
        v-if="messenger != 'messenger'"
      >
        <div class="item-member-conversation">
          <img class="img-avatar-member" v-bind:src="item.avatar" alt />
          <div class="name-and-latest-message">
            <h4 v-bind:class="{ presenceActive: item.state }">
              {{ item.name }}
            </h4>
            <h3 class="latest-message">{{ item.latestMessage }}</h3>
          </div>
        </div>
      </router-link>
      <a href="#" @click.prevent="forwardConversation(item.id,item.name)" v-else>
        <div class="item-member-conversation">
          <img class="img-avatar-member" v-bind:src="item.avatar" alt />
          <div class="name-and-latest-message">
            <h4 v-bind:class="{ presenceActive: item.state }">
              {{ item.name }}
            </h4>
            <h3 class="latest-message">{{ item.latestMessage }}</h3>
          </div>
        </div>
      </a>
    </div>

    <!--
        <div class="item unread">
            <a href="#">
                <div>
                    <vs-avatar size="50px" src="https://avatars2.githubusercontent.com/u/31676496?s=460&v=4"/>
                    <h3 class="name presenceActive">Nguyễn Văn Thường</h3>
                    <h3 class="latest-message">hay day</h3>
                </div>
            </a>
        </div>
        <div class="item">
            <a href="#">
                <div>
                    <vs-avatar size="50px" src="https://avatars2.githubusercontent.com/u/31676496?s=460&v=4"/>
                    <h3 class="name presenceActive">Nguyễn Văn Thường</h3>
                    <h3 class="latest-message">hay day</h3>
                </div>
            </a>
        </div>
    -->
    <div class="moremess" v-if="conversation && limmit < conversation.length">
      <a href="#" class="moremessage" @click="loadMore()">
        <div>Xem tin nhắn cũ hơn...</div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.item a {
  text-decoration: none;
}

.item-member-conversation {
  display: flex;
  flex-direction: row;
}
.name-and-latest-message {
  margin-left: 10px;
}

.img-avatar-member {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.anloadmore {
  display: none !important;
}

.container-conversation {
  flex-grow: 999;
  display: flex;
  flex-direction: column;
}

.moremessage {
  color: #3b5998;
  font-size: 14px;
  line-height: 18px;
}

.moremess {
  padding: 5px;
}

.moremess:hover {
  background: rgba(0, 0, 0, 0.05);
}

.presenceActive::after {
  content: "";
  background-color: #42b72a;
  border: 2px solid #f2f3f5;
  border-radius: 9px;
  margin-left: 3px;
  display: inline-block;
  height: 11px;
  width: 11px;
  z-index: 2;
}

.unread {
  background-color: #ecf0f7 !important;
}

.latest-message {
  color: #4b4f56;
  font-size: 12px;
  line-height: 16px;
}

.item:hover {
  background: rgba(0, 0, 0, 0.05);
}
.item {
  position: relative;
  padding: 5px;
  border-bottom: 1px solid;
  border-color: #e9e9e9;
  background-color: #fff;
}

.item-header {
  position: relative;
  padding: 10px;
  border-bottom: 1px solid;
  border-color: #e9e9e9;
  background-color: #fff;
}
.name {
  color: #576b95;
  position: absolute;
  top: 12px;
  left: 65px;
  font-size: 14px;
  line-height: 18px;
}
</style>

<script>
import { setTimeout } from "timers";

export default {
  data() {
    return {
      limmit: 8,
      conversation: null,
      rooms: [],
      roomInfo: [],
      member: null,
      publicInfo: null
    };
  },
  computed: {
    getConversations() {
      const conversation = this.roomInfo;
      conversation.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      return conversation;
    },
    type() {
      return this.$route.params.type;
    },
    messenger() {
      return this.$route.params.messenger;
    }
  },
  methods: {
    async forwardConversation(conversation_id,conversation_name) {
      const db = this.$store.state.db;
      const id = this.$store.getters["user/id"];
      await db.ref("forward/" + id).update({
        conversation_id: conversation_id
      });

      const sendToBot = this.$store.state.functions.httpsCallable("sendToBot");
      await sendToBot({
        message: `Bot sẽ chuyển tiếp cuộc trò chuyện của bạn với ${conversation_name}`
      })

      window.MessengerExtensions.requestCloseBrowser(
        async function success() {
          // webview closed

        },
        function error(err) {
          // an error occurred
          console.log(err);
        }
      );
    },
    loadMore: function() {
      this.limmit += 4;
    },
    fetchRoom: async function() {
      const type = this.$route.params.type;
      const user = this.$store.getters["user/user"];
      const db = this.$store.state.db;
      if (!user) return;
      this.$bindAsArray(
        "rooms",
        db
          .ref("conversation/" + user.id + "/" + type)
          .orderByChild("timestamp")
          .limitToLast(this.limmit)
      );
    },
    fetchRomInfo: async function() {
      const rooms = this.rooms;
      const task = [];
      const db = this.$store.state.db;
      for (let room of rooms) {
        const conversation_id = room[".key"];
        task.push(db.ref("room_names/" + conversation_id).once("value"));
      }
      const dataSnap = await Promise.all(task);

      for (let e of dataSnap) {
        const conversation = e.val();
        if (!conversation) {
          continue;
        }
        if (conversation.type == "friend") {
          this.handleFriendInfo(e);
        } else if (conversation.type == "group" && e.key !== "chattong") {
          this.handleGroupInfo(e);
        }
      }
    },
    getMe(conversation) {
      if (conversation.public) {
        return this.$store.getters["user/id"];
      } else {
        return this.$store.getters["user/uid"];
      }
    },
    getFriend(conversation) {
      const me = this.getMe(conversation);
      const member = conversation.members;
      for (let i in member) {
        if (i !== me) {
          return i;
        }
      }
    },
    handleGroupInfo(conSnap) {
      const data = conSnap.val();
      if (!data.avatar) {
        data.avatar = "/img/default-group.png";
      }
      return this.addRoomInfo({
        id: conSnap.key,
        ...data
      });
    },
    handleFriendInfo(conSnap) {
      const data = conSnap.val();
      const friend = this.getFriend(data);
      const db = this.$store.state.db;
      const seft = this;
      if (data.public) {
        db.ref("public/" + friend).off("value");
        db.ref("public/" + friend).on("value", snap => {
          const userInfo = snap.val();
          const name = userInfo.full_name || "Sinh viên PTIT";
          const avatar = userInfo.avatar || "/img/default-avatar.png";
          const state = userInfo.state === "online" ? true : false;
          return seft.addRoomInfo({
            id: conSnap.key,
            ...data,
            name,
            avatar,
            state
          });
        });
      } else {
        db.ref("public/" + friend).off("value");
        db.ref("public/" + friend).on("value", snap => {
          // sẽ xử lý thêm
          const userInfo = snap.val();
          const name = userInfo.nick_name || "Sinh viên PTIT";
          const avatar = userInfo.avatar || "/img/default-avatar.png";
          const state = userInfo.state === "online" ? true : false;
          return seft.addRoomInfo({
            id: conSnap.key,
            ...data,
            name,
            avatar,
            state
          });
        });
      }
    },
    addRoomInfo(data) {
      const roominfo = this.roomInfo;
      const s = roominfo.filter(item => item.id !== data.id);
      s.push(data);
      this.roomInfo = [...s];
    },
    async handleInfo(array, mssv) {
      const db = this.$store.state.db;
      const task = [];

      for (let item of array) {
        if (item.type == "friend") {
          task.push(db.ref("members/" + item.id).once("value"));
        }
      }
      const _r = await Promise.all(task);

      const task2 = [];

      for (let item of _r) {
        const data = item.val();
        let reception = null;
        for (let sv in data) {
          if (sv != mssv) {
            reception = sv;
            break;
          }
        }
        task2.push(db.ref("public/" + reception).once("value"));
      }

      const _r2 = await Promise.all(task2);

      for (let i in array) {
        if (array[i].type === "friend") {
          array[i] = { ...array[i], ..._r2[i].val() };
        }
      }

      this.conversation = array.map(e => {
        const obj = {};
        obj["name"] = e.full_name || "N/A";
        obj["avatar"] =
          e.avatar ||
          (e.type == "friend"
            ? "/img/default-avatar.png"
            : "/img/default-group.png");
        obj["id"] = e.id;
        return obj;
      });
    },
    getLatestMessage(message) {
      if (message.type === "text") {
        return message.data.text;
      } else if (message.type === "emoji") {
        return "đã gửi một emoji";
      } else if (message.type === "file" && message.file.type == "img") {
        return "đã gửi một hình ảnh";
      } else if (message.type === "file") {
        return "đã gửi một file";
      } else {
        return "đã gửi một tin nhắn";
      }
    },
    handlePublicInfo(info) {
      let name =
        info["name"] ||
        info["full_name"] ||
        info["nick_name"] ||
        "Sinh viên PTIT";
      if (info.basicinfo && info.basicinfo.ten_sv) {
        name = info.basicinfo.ten_sv;
      }
      const obj = {};
      obj["state"] =
        info["state"] && info["state"] == "online" ? "online" : "offline";
      obj["avatar"] = info["avatar"] || "/img/default-avatar.png";
      obj["name"] = name;

      return obj;
    },
    handleRoomInfo(room) {
      if (!room.avatar && room.type != "friend") {
        room.avatar = "/img/default-group.png";
      }
      return room;
    }
  },
  created() {
    this.fetchRoom();
  },
  watch: {
    rooms(newVal, oldVal) {
      debugger;
      this.fetchRomInfo();
    },
    type(newVal, oldVal) {
      this.rooms = [];
      this.roomInfo = [];
      this.fetchRoom();
    }
  }
};
</script>
