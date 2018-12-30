<template>
  <div class="container-user-info" v-if="isForward">
    <div class="profile large">
      <div class="content-user-info">
        <div class="cover">
          <div class="cover-img" :style="{ 'background-image': `url('${getBasicInfo.cover}')`}">
            <div :class="{layer:true,visible:loadCoverUpload}">
              <div class="loader"></div>
            </div>
            <a v-if="typeProfile==='me'" class="image-wrapper" href="#">
              <form id="coverForm" class="form-input-img" action="#">
                <input
                  class="hidden-input"
                  @change.prevent="_handleChangeCover"
                  accept="image/*"
                  hidden
                  id="changeCover"
                  type="file"
                >
                <label class="edit fas fa-pencil-alt" for="changeCover" title="Change cover"></label>
              </form>
            </a>
          </div>
        </div>
        <div class="user-info">
          <div class="profile-pic">
            <img :src="getBasicInfo.avatar">
            <div :class="{layer:true,visible:loadAvatarUpload}">
              <div class="loader"></div>
            </div>
            <a v-if="typeProfile==='me'" class="image-wrapper" href="#">
              <form id="profilePictureForm" class="form-input-img" action="#">
                <input
                  accept="image/*"
                  @change.prevent="_handleChangeAvatar"
                  class="hidden-input"
                  id="changePicture"
                  type="file"
                >
                <label
                  class="edit fas fa-pencil-alt"
                  for="changePicture"
                  type="file"
                  title="Change picture"
                ></label>
              </form>
            </a>
          </div>
          <div class="username">
            <div v-if="!isEditName" class="name">
              <span class="verified"></span>
              <span style="margin-left: 10px;">{{getBasicInfo.name || 'Sinh viên PTIT'}}</span>
              <a
                v-if="typeProfile=='me'"
                @click="isEditName=true;editName=getBasicInfo.name"
                href="#"
                class="edit-name fas fa-pencil-alt"
              ></a>
            </div>
            <div v-else class="name">
              <span class="verified"></span>
              <div
                style="max-width: 200px;margin-bottom:5px;display: inline-block;margin-left: 40px;"
              >
                <b-form-input v-model="editName" type="text" placeholder="Nhập tên..."></b-form-input>
              </div>

              <a href="#" @click="changeNickName(getBasicInfo.id)" class="edit-name fas fa-check"></a>
            </div>

            <div class="about">sinh viên</div>

            <div
              v-if="typeProfile=='me'"
              class="notication-rule"
            >Thêm thông tin của bạn vào đây để cho người kia thấy.</div>
            <div v-if="typeProfile=='friend'" class="notication-rule">Thông tin của người lạ.</div>
            <div class="list-info-user">
              <div class="item-info-user">
                <div class="item-name-user">
                  <h6>
                    <strong>Thông tin cơ bản</strong>
                  </h6>
                  <b-button
                    v-if="typeProfile=='me'"
                    size="sm"
                    @click="addBasicInfoShowModal()"
                    style="padding:2px;"
                    variant="ghost-success"
                  >Add Info</b-button>
                </div>

                <div class="info-item-user" v-for="(item,key) in getBasicInfoShow" :key="key">
                  <h6>{{item.name}}</h6>
                  <h6>
                    {{item.value}}
                    <!--
                    <a @click="removeBasicInfo(item.key)" href="#">
                      <i class="hidden-item-info fas fa-minus-circle"></i>
                    </a>
                    -->
                  </h6>
                </div>
              </div>

              <div class="item-info-user">
                <div class="item-name-user">
                  <h6>
                    <strong>Khoe điểm</strong>
                  </h6>
                  <b-button
                    v-if="typeProfile=='me'"
                    @click="addMarksShowModal()"
                    size="sm"
                    style="padding:2px;"
                    variant="ghost-success"
                  >Add Info</b-button>
                </div>
                <div class="info-item-user" v-for="(item,key) in getMarkShow" :key="key">
                  <h6 style="max-width: 80%;">{{item.key}}</h6>
                  <h6>
                    {{item.value}}
                    <!--
                    <a @click="removeMark(item.msmh)" href="#">
                      <i class="hidden-item-info fas fa-minus-circle"></i>
                    </a>
                    -->
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <b-modal
        centered
        hide-footer
        v-model="showModal"
        title="Thêm thông tin"
        header-class="header-modal-upload"
        body-class="body-class-upload"
        modal-class="modal-class-upload"
        :body-text-variant="bodyTextVariant"
      >
        <b-form v-if="type==='MARK'">
          <b-form-input
            id="exampleInput1"
            type="email"
            v-model="form.search"
            required
            placeholder="Tìm kiếm ex: A+ , lập trình c, bas12415..."
          ></b-form-input>
        </b-form>
        <div v-if="type==='INFO'" class="list-info-user">
          <div class="item-info-user">
            <div v-for="(item_mark,key) in getFullBasicInfo" :key="key" class="info-item-user">
              <h6>{{item_mark.name}}</h6>
              <h6>
                {{item_mark.value}}
                <a @click="addBasicInfo(item_mark.key)" href="#">
                  <i class="add-item-info fas fa-plus"></i>
                </a>
              </h6>
            </div>
          </div>
        </div>
        <div v-if="type==='MARK'" class="list-info-user">
          <div class="item-info-user">
            <div class="info-item-user" v-for="(item,key) in searchMark" :key="key">
              <h6>{{item.tenmh}}</h6>
              <h6 style="width:40px">
                {{item.xeploai}}
                <a @click="addMark(item.msmh)" href="#">
                  <i class="add-item-info fas fa-plus"></i>
                </a>
              </h6>
            </div>
          </div>
        </div>
      </b-modal>
      <b-modal
        size="lg"
        centered
        hide-footer
        v-model="showModalResizeImage"
        title="Thay đổi kích thước hình ảnh"
        :header-bg-variant="headerBgVariant"
        header-class="header-modal-upload"
        body-class="body-class-upload"
        modal-class="modal-class-upload"
        :body-text-variant="bodyTextVariant"
      >
        <div style="height:400px;" v-show="typeUpload=='cover'">
          <vue-croppie
            ref="croppieRef1"
            :enableOrientation="true"
            :mouseWheelZoom="false"
            :enableResize="false"
            :viewport="{ width: 700, height: 300}"
          ></vue-croppie>
        </div>
        <div style="height:400px;" v-show="typeUpload=='avatar'">
          <vue-croppie
            ref="croppieRef2"
            :enableOrientation="true"
            :mouseWheelZoom="false"
            :enableResize="false"
            :viewport="{ width: 300, height: 300}"
          ></vue-croppie>
        </div>
        <div>
          <b-btn
            style="margin-top: 50px;width: 100px;margin-left: auto;margin-right: auto;"
            @click="uploadImgCrop"
            variant="outline-success"
            block
          >Xong</b-btn>
        </div>
      </b-modal>
    </div>
  </div>
  <div v-else style="text-align:center;margin:20px;">
    <h5>Bạn đang không có cuộc trò chuyện với người lạ nào</h5>
  </div>
</template>

<style>
.header-modal-upload {
  background-color: #f5f6f7;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 3px 3px 0 0;
  color: #1d2129;
  font-weight: bold;
  line-height: 19px;
  padding: 7px 10px;
}
.header-modal-upload h5 {
  font-size: 15px;
}
.body-class-upload {
  background-color: #fff !important;
}
</style>


<style scoped>
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg) translate(-50%);
    transform: rotate(0deg) translate(-50%);
  }
  100% {
    -webkit-transform: rotate(360deg) translate(-50%);
    transform: rotate(360deg) translate(-50%);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg) translate(-50%);
    transform: rotate(0deg) translate(-50%);
  }
  100% {
    -webkit-transform: rotate(360deg) translate(-50%);
    transform: rotate(360deg) translate(-50%);
  }
}
.notication-rule {
  font-family: Helvetica, "Helvetica Neue", "Tahoma";
  font-size: 15px;
  color: #adadad;
  text-align: left;
  margin-left: 5px;
  margin-top: 10px;
}

.edit-name {
  margin-left: 10px;
  text-decoration: none;
}
.edit-name:hover {
  text-decoration: none !important;
}
.add-item-info {
  color: #4dbd74;
}

.hidden-item-info {
  color: #f86c6b;
}
.info-item-user {
  padding: 5px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
}

.item-name-user {
  background: #f5f6f7;
  padding: 7px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}
.content-user-info {
  max-width: 700px;
  margin: auto;
  background-color: #fff;
}
.list-info-user {
  color: #4b4f56 !important;
}
.item-info-user h6 {
  text-align: left;
}
.item-info-user {
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  margin: 0 0 12px 0;
}

.cover-img {
  height: 300px;
  max-width: 700px;
  margin: auto;
  position: relative;
}
.loader {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translateY(-50%) translateX(-50%);
  transform: translateY(-50%) translateX(-50%);
  -webkit-animation: spin 0.35s infinite linear;
  animation: spin 0.35s infinite linear;
  border: 2px solid #707070;
  border-radius: 50%;
  border-top-color: white;
  height: 25px;
  -webkit-transform-origin: left;
  transform-origin: left;
  top: 45%;
  width: 25px;
}
.hidden-input {
  left: -999px;
  position: absolute;
}
.container-user-info {
  background-color: #e9ebee;
}
.profile {
  *zoom: 1;
  background-color: #e9ebee;
  border-radius: 2px;
  display: block;
  float: none;
  margin: 5px auto;
  overflow: hidden;
  padding-bottom: 20px;
}
.profile:before,
.profile:after {
  content: "";
  display: table;
}
.profile:after {
  clear: both;
}
.about {
  font-family: Helvetica, "Helvetica Neue", "Tahoma";
  font-size: 12px;
  color: #adadad;
  line-height: 17px;
}
.image-wrapper {
  background: rgba(0, 0, 0, 0.2);
  bottom: -50px;
  height: 50px;
  left: 0;
  position: absolute;
  transition: bottom 0.15s linear;
  width: 100%;
}
.edit {
  position: relative;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  color: white;
  cursor: pointer;
  font-size: 22px;
  top: 10px;
}
.cover {
  height: 300px;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.cover img {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  height: 300px;
}
.cover .image-wrapper {
  bottom: auto;
  height: 45px;
  left: auto;
  position: absolute;
  right: 0;
  top: 0;
  width: 45px;
}
.name {
  font-family: Helvetica, "Helvetica Neue", "Tahoma";
  font-size: 18px;
}
.profile-pic {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  border-radius: 50%;
  border: 4px solid white;
  height: 210px;
  overflow: hidden;
  -webkit-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  width: 210px;
  top: 0;
}
.profile-pic img {
  box-sizing: border-box;
  height: 100%;
  left: 50%;
  max-height: 100%;
  position: absolute;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  transition: all 0.15s ease-out;
  width: auto;
}
.profile-pic:hover .image-wrapper {
  bottom: 0;
}
.username {
  margin-top: 122px;
  text-align: center;
}
.user-info {
  *zoom: 1;
  position: relative;
}
.user-info:before,
.user-info:after {
  content: "";
  display: table;
}
.user-info:after {
  clear: both;
}
.container-user-info {
  flex-grow: 999;
  overflow-y: auto;
}
.layer {
  background-color: rgba(0, 0, 0, 0.25);
  display: none;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
.layer.visible {
  display: block;
}
</style>


<script>
import firebase from "firebase";

export default {
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
      headerBgVariant: "#f5f6f7",
      headerTextVariant: "dark",
      bodyBgVariant: "light",
      bodyTextVariant: "dark",
      showModal: false,
      form: {
        search: null,
        type: null
      },
      coverImg: null,
      avatarImg: null,
      showModalResizeImage: false,
      cropped: null,
      typeUpload: null,
      loadAvatarUpload: false,
      loadCoverUpload: false,
      meInfo: null,
      friendInfo: null,
      type: null,
      isEditName: false,
      editName: "",
      typeProfile: null,
      forward: null,
      conversationInfo: null,
      isForward: false
    };
  },
  async created() {
    this.typeProfile = this.$route.params.id;

    const id = this.$store.getters["user/id"];

    // private info
    const forward = await this.$store.state.db
      .ref("forward/" + id + "/conversation_id")
      .once("value");
    if (forward.val()) {
      this.isForward = true;
    }

    this.$bindAsObject("forward", this.$store.state.db.ref("forward/" + id));
  },
  computed: {
    searchMark() {
      if (!this.form.search) return;
      const mark = this.$store.getters["user/user"].bangdiem;
      const query = this.form.search.toLowerCase();
      const result = [];
      for (let i in mark) {
        const namhoc = mark[i];
        for (let k of namhoc) {
          const msmh = k[1].toLowerCase();
          const tenmh = k[2].toLowerCase();
          const xeploai = k[16].toLowerCase();

          if (this.getMarkShow.find(item => item.msmh === k[1])) {
            continue;
          }

          if (query == xeploai) {
            result.push({
              tenmh: k[2],
              xeploai: k[16],
              msmh: k[1]
            });
          } else if (tenmh.indexOf(query) >= 0 && query.length >= 3) {
            result.push({
              tenmh: k[2],
              xeploai: k[16],
              msmh: k[1]
            });
          } else if (msmh.indexOf(query) >= 0 && query.length >= 3) {
            result.push({
              tenmh: k[2],
              xeploai: k[16],
              msmh: k[1]
            });
          }
        }
      }
      return result;
    },
    getBasicInfo() {
      // get name,avatar,cover
      if (this.typeProfile == "me") {
        const publicInfo = { ...this.meInfo };
        const share = this.getMe;
        delete publicInfo["share"];
        const handlePublicInfo = this.handlePublicInfo(
          publicInfo[".key"],
          publicInfo
        );
        const handleShareInfo = this.handleShareInfo(publicInfo[".key"], share);
        const merge = {
          ...handlePublicInfo,
          ...handleShareInfo
        };
        return merge;
      } else if (this.typeProfile == "friend") {
        const privateInfo = { ...this.friendInfo };
        const share = this.getFriend;
        delete privateInfo["share"];
        const handlePublicInfo = this.handlePublicInfo(
          privateInfo[".key"],
          privateInfo
        );
        const handleShareInfo = this.handleShareInfo(
          privateInfo[".key"],
          share
        );
        const merge = {
          ...handlePublicInfo,
          ...handleShareInfo
        };
        if (!merge.name) {
          merge.name = "Sinh viên PTIT";
        }
        return merge;
      } else {
        return null;
      }
    },
    getFullBasicInfo() {
      const basicinfo = this.$store.getters["user/user"];
      if (!basicinfo) return [];
      const result = [];
      for (let key in basicinfo) {
        let name;

        if (this.getBasicInfoShow.find(item => item.key === key)) {
          continue;
        }

        if (key == "gioi_tinh") {
          name = "Giới tính";
        } else if (key == "he_dao_tao") {
          name = "Hệ đào tạo";
        } else if (key == "khoa") {
          name = "Khoa";
        } else if (key == "khoa_hoc") {
          name = "Khóa học";
        } else if (key == "lop") {
          name = "Lớp";
        } else if (key == "nganh") {
          name = "Ngành";
        } else if (key == "ngay_sinh") {
          name = "Ngày sinh";
        } else if (key == "noi_sinh") {
          name = "Nơi sinh";
        } else if (key == "ten_sv") {
          name = "Tên sinh viên";
        } else {
          continue;
        }
        result.push({
          name,
          value: basicinfo[key],
          key
        });
      }
      return result;
    },
    getMarkShow() {
      let bangdiem = null;
      if (this.typeProfile == "me") {
        if (!this.getMe) return [];
        bangdiem = this.getMe.bangdiem;
      } else if (this.typeProfile == "friend") {
        if (!this.getFriend) return [];
        bangdiem = this.getFriend.bangdiem;
      }
      if (!bangdiem) return [];
      const result = [];
      for (let key in bangdiem) {
        result.push({
          key: bangdiem[key][2],
          value: bangdiem[key][16],
          msmh: bangdiem[key][1]
        });
      }
      return result;
    },
    getBasicInfoShow() {
      let basicinfo = null;
      if (this.typeProfile == "me") {
        if (!this.getMe) return [];
        basicinfo = this.getMe.basicinfo;
      } else if (this.typeProfile == "friend") {
        if (!this.getFriend) return [];
        basicinfo = this.getFriend.basicinfo;
      }
      if (!basicinfo) return [];
      const result = [];
      for (let key in basicinfo) {
        let name;
        if (key == "gioi_tinh") {
          name = "Giới tính";
        } else if (key == "he_dao_tao") {
          name = "Hệ đào tạo";
        } else if (key == "khoa") {
          name = "Khoa";
        } else if (key == "khoa_hoc") {
          name = "Khóa học";
        } else if (key == "lop") {
          name = "Lớp";
        } else if (key == "nganh") {
          name = "Ngành";
        } else if (key == "ngay_sinh") {
          name = "Ngày sinh";
        } else if (key == "noi_sinh") {
          name = "Nơi sinh";
        } else if (key == "ten_sv") {
          name = "Tên sinh viên";
        } else {
          continue;
        }
        result.push({
          name,
          value: basicinfo[key],
          key
        });
      }
      return result;
    },
    getName() {
      return "";
    },
    getAvatar() {
      return "";
    },
    getCover() {
      return "";
    },
    getMe() {
      if (!this.conversationInfo) {
        return null;
      }
      const uid = this.$store.getters["user/uid"];
      return this.conversationInfo[uid] || null;
    },
    getFriend() {
      if (!this.conversationInfo) {
        return null;
      }
      const uid = this.$store.getters["user/uid"];
      for (let i in this.conversationInfo) {
        if (i !== uid && i !== ".key") {
          return this.conversationInfo[i] || null;
        }
      }
      return null;
    }
  },
  methods: {
    async changeNickName(id) {
      this.isEditName = false;
      const editName = this.editName;

      if (!editName || editName == this.getBasicInfo.name) return;

      const now = new Date().getTime();

      if (now - this.getBasicInfo.lastChangeName < 1440000) {
        return this.$root.showError(
          "Bạn không thể đổi tên nhiều lần trong 24h"
        );
      }

      const db = this.$store.state.db;

      await db.ref("public/" + id).update({
        nick_name: editName,
        lastChangeName: firebase.database.ServerValue.TIMESTAMP
      });
      this.isEditName = "";
    },
    handlePublicInfo(id, info) {
      // xu ly state , name , avatar , cover avatar
      const obj = {};
      obj["id"] = id;
      obj["name"] = info["full_name"] || info["nick_name"];
      obj["state"] =
        info["state"] && info["state"] == "online" ? "online" : "offline";
      obj["avatar"] = info["avatar"] || "/img/default-avatar.png";
      obj["cover"] =
        info["cover"] || "https://source.unsplash.com/random/700x300";
      obj["lastChangeName"] = info["lastChangeName"] || 0;

      return obj;
    },
    handleShareInfo(id, info) {
      if (!info) return {};

      const obj = {};
      obj["id"] = id;
      if (info.basicinfo && info.basicinfo.nick_name) {
        obj["name"] = info.basicinfo.nick_name;
      }
      return {
        ...obj
      };
    },
    async uploadImgCrop() {
      this.showModalResizeImage = false;

      let options = {
        format: "jpeg",
        type: "blob"
      };
      const seft = this;

      if (this.typeUpload == "avatar") {
        this.loadAvatarUpload = true;
        this.$refs.croppieRef2.result(options, async output => {
          const url = await seft.uploadImg(
            this.getBasicInfo.id + "/avatar.jpeg",
            output
          );
          await seft.$store.state.db
            .ref("public/" + this.getBasicInfo.id)
            .update({
              avatar: url
            });
          seft.loadAvatarUpload = false;
        });
      } else if (this.typeUpload == "cover") {
        this.loadCoverUpload = true;
        this.$refs.croppieRef1.result(options, async output => {
          const url = await seft.uploadImg(
            this.getBasicInfo.id + "/cover.jpeg",
            output
          );
          await seft.$store.state.db
            .ref("public/" + this.getBasicInfo.id)
            .update({
              cover: url
            });
          seft.loadCoverUpload = false;
        });
      }
    },
    async uploadImg(filePath, file) {
      return firebase
        .storage()
        .ref(filePath)
        .put(file)
        .then(function(fileSnapshot) {
          return fileSnapshot.ref.getDownloadURL().then(url => {
            return url;
          });
        });
    },
    async _handleChangeCover(e) {
      const file = e.target.files[0];
      document.querySelectorAll(".form-input-img").forEach(e => e.reset());

      if (file.type.indexOf("image/") < 0) {
        return this.$root.showError("Sai định dạng file");
      }

      const reader = new FileReader();
      const seft = this;

      reader.onload = function(e) {
        seft.showModalResizeImage = true;
        seft.typeUpload = "cover";
        seft.$refs.croppieRef1.bind({
          url: e.target.result
        });
      };

      reader.readAsDataURL(file);
    },
    _handleChangeAvatar(e) {
      const file = e.target.files[0];
      document.querySelectorAll(".form-input-img").forEach(e => e.reset());

      if (file.type.indexOf("image/") < 0) {
        return this.$root.showError("Sai định dạng file");
      }

      const reader = new FileReader();
      const seft = this;

      reader.onload = function(e) {
        seft.showModalResizeImage = true;
        seft.typeUpload = "avatar";
        seft.$refs.croppieRef2.bind({
          url: e.target.result
        });
      };

      reader.readAsDataURL(file);
    },
    addBasicInfoShowModal: function() {
      this.showModal = true;
      this.type = "INFO";
    },
    addMarksShowModal: function() {
      this.showModal = true;
      this.type = "MARK";
    },
    addBasicInfo: async function(att) {
      const remote = this.$store.state.functions.httpsCallable("remote");
      try {
        const r = await remote({
          type: "addBasicInfo",
          att: att,
          conversation_id: this.forward.conversation_id
        });
        if (r.data.error) {
          throw r.data.error;
        }
        this.$root.showSuccess("Đã thêm thông tin vào cuộc trò chuyện");
      } catch (error) {
        this.$root.showError(error.toString());
      }
    },
    addMark: async function(msmh) {
      const remote = this.$store.state.functions.httpsCallable("remote");
      try {
        const r = await remote({
          type: "addMark",
          msmh: msmh,
          conversation_id: this.forward.conversation_id
        });
        if (r.data.error) {
          throw r.data.error;
        }
        this.$root.showSuccess("Đã thêm thông tin vào cuộc trò chuyện");
      } catch (error) {
        this.$root.showError(error.toString());
      }
    },
    async removeBasicInfo(att) {},
    async removeMark(msmh) {}
  },
  watch: {
    "$route.params": function(val) {
      this.typeProfile = val.id;
      this.isEditName = false;
    },
    forward(newVal, oldVal) {
      if (!newVal || !newVal.conversation_id) {
        this.isForward = false;
        return;
      }
      this.isForward = true;
      if (oldVal.conversation_id) {
        try {
          this.$unbind("conversationInfo");
        } catch {}
        this.$bindAsObject(
          "conversationInfo",
          this.$store.state.db.ref("members/" + newVal.conversation_id)
        );
      } else {
        this.$bindAsObject(
          "conversationInfo",
          this.$store.state.db.ref("members/" + newVal.conversation_id)
        );
      }
    },
    conversationInfo(newVal, oldVal) {
      if (Object.keys(newVal).length === 0) {
        return;
      }
      const tmp = { ...newVal };
      delete tmp[".key"];
      const me = this.$store.getters["user/uid"];

      try {
        this.$unbind("meInfo");
        this.$unbind("friendInfo");
      } catch {}

      for (let i in tmp) {
        if (i === me) {
          this.$bindAsObject("meInfo", this.$store.state.db.ref("public/" + i));
        } else {
          this.$bindAsObject(
            "friendInfo",
            this.$store.state.db.ref("public/" + i)
          );
        }
      }
    }
  }
};
</script>