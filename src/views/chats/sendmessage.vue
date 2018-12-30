<template>
  <div class="main-search">
    <div class="input-search">
      <b-form-input
        style="width: 80%;margin:auto;"
        v-model="query"
        type="text"
        placeholder="Mã sinh viên hoặc tên..."
      ></b-form-input>
    </div>
    <h4
      v-if="result && result.length == 0"
      style="text-align:center;margin:10px;"
    >
      Không tìm thấy kết quả nào
    </h4>

    <PulseLoader :loading="loading" style="text-align:center;"></PulseLoader>
    <div class="list-member">
      <div class="item-member" v-for="item of getMember" v-bind:key="item.id">
        <img class="img-avatar-member" v-bind:src="item.avatar" />
        <a class="name-member" href="#">
          <h5 class="name-student-search">{{ item.name }}</h5>
          <p class="mssv-class">{{ item.id }}</p>
          <b-button
            size="sm"
            @click="showModalSendMessage(item.id)"
            variant="outline-success"
          >
            <i class="far fa-comments"></i> <span>Tin nhắn</span>
          </b-button>
        </a>
      </div>
    </div>
    <div>
      <b-modal
        centered
        hide-footer
        v-model="showModal"
        title="Send message"
        :header-bg-variant="headerBgVariant"
        :header-text-variant="headerTextVariant"
        :body-bg-variant="bodyBgVariant"
        :body-text-variant="bodyTextVariant"
      >
        <b-container fluid>
          <b-row>
            <div class="info-student" v-if="selectStudent">
              <h6>Sinh viên: {{ selectStudent.full_name }}</h6>
              <h6>Mã sinh viên: {{ selectStudent.mssv }}</h6>
              <h6>Lớp: {{ selectStudent.class }}</h6>
            </div>
          </b-row>
          <b-row class="mb-1 text-center">
            <b-form-textarea
              id="textarea1"
              v-model="message"
              placeholder="Enter message"
              :rows="3"
              :max-rows="6"
            ></b-form-textarea>
          </b-row>
          <b-row class="send-btn-message">
            <b-button
              v-bind:disabled="disbtn"
              variant="outline-success"
              @click="sendMessage()"
            >
              <i class="fa fa-paper-plane"></i>
            </b-button>
          </b-row>
        </b-container>
      </b-modal>
    </div>
  </div>
</template>

<style scoped>
.item-member:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.name-student-search {
  margin-bottom: 2px;
}
.mssv-class {
  margin: 0;
  color: #ff1493;
  font-size: 13px;
}
.info-student {
  margin: 10px;
}
.send-btn-message {
  margin-top: 10px;
  justify-content: flex-end !important;
}
.main-search {
  flex-grow: 999;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.input-search {
  margin: 20px;
}
.list-member {
  overflow-y: scroll;
}
.item-member {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #e5e5e5;
  padding: 10px;
  height: 90px;
}
.img-avatar-member {
  width: 70px;
  height: 70px;
}
.name-member {
  padding-left: 10px;
}
.name-member:hover {
  text-decoration: none;
}
</style>

<script>
import PulseLoader from "vue-spinner/src/PulseLoader.vue";

export default {
  components: {
    PulseLoader
  },
  data: () => {
    return {
      variants: [
        "primary",
        "secondary",
        "success",
        "warning",
        "danger",
        "info",
        "light",
        "dark"
      ],
      headerBgVariant: "success",
      headerTextVariant: "dark",
      bodyBgVariant: "light",
      bodyTextVariant: "dark",
      query: "",
      checkTask: [],
      loading: false,
      result: null,
      showModal: false,
      selectStudent: null,
      message: "",
      disbtn: false
    };
  },
  computed: {
    getMember: function() {
      const r = [];
      for (let i in this.result) {
        const item = this.result[i];
        const obj = {};
        obj["name"] = item.full_name;
        obj["avatar"] = "/img/default-avatar.png";
        obj["id"] = item.mssv;
        r.push(obj);
      }
      return r;
    }
  },
  methods: {
    async searchStudent() {
      if (!this.query) {
        return;
      }
      this.loading = true;

      const remote = this.$store.state.functions.httpsCallable("remote");
      try {
        const { data } = await remote({
          type: "searchSV",
          query: this.query
        });
        if (data.error) {
          this.result = [];
        }
        this.result = data.result;
      } catch (error) {
        return this.$root.showError(error);
      }

      this.loading = false;
    },
    showModalSendMessage(mssv) {
      this.showModal = true;
      this.selectStudent = this.result.find(e => e.mssv === mssv);
    },
    closemodal: function() {},
    async sendMessage() {
      const remote = this.$store.state.functions.httpsCallable("remote");
      try {
        if (!this.message) {
          throw "Message empty...";
        }
        this.disbtn = true;
        const { data } = await remote({
          type: "sendMessage",
          mssv: this.selectStudent.mssv,
          message: this.message
        });
        if (data.error) {
          throw data.error;
        }
        this.disbtn = false;
        const { conversation_id } = data;
        this.$router.push({ path: "/chatroom/" + conversation_id });
        // router chatroom

        this.message = "";
        this.showModal = false;
      } catch (error) {
        this.disbtn = false;
        this.$root.showError(String(error));
      }
    }
  },
  watch: {
    query: function(newVal) {
      const tmp = new Date().getTime();
      while (this.checkTask.length > 0) {
        if (this.checkTask[0] < tmp) {
          this.checkTask.shift();
        }
      }
      this.checkTask.push(tmp);
      setTimeout(() => {
        if (this.checkTask.includes(tmp)) {
          this.searchStudent(newVal);
        }
      }, 500);
    }
  }
};
</script>
