<template>
  <div class="animated fadeIn setting-layout">
    <b-row>
      <b-col md="12">
        <b-card no-body>
          <div slot="header" class="header-notication">
            <h5>Cho phép thông báo</h5>
            <c-switch
              variant="3d"
              color="primary"
              size="sm"
              v-model="alowNotication"
              :disabled="disableAlowNotication"
              @change="handleNotification"
            />
          </div>
          <b-card-body class="p-0">
            <div v-if="!contextMessenger">
              <div class="item-notication" v-if="this.tokenAlowNotication && statusServer.hasOwnProperty('uid')">
                <h6 >Thông báo TKB</h6>
                  <cSwitch variant="pill" color="success" size="sm" 
                  :disabled="disableNotificationTKB" 
                  :defaultChecked="isActiveTKBNotifi"
                  v-model="modelActiveTKB"  
                  />
              </div>
              <div class="item-notication" v-if="this.tokenAlowNotication && statusServer.hasOwnProperty('uid')">
                <h6>Thông báo lịch thi</h6>
                <cSwitch variant="pill" color="success" size="sm"  
                  :disabled="disableNotificationLichThi" 
                  :defaultChecked="isActiveLichThiNotifi"
                  v-model="modelActiveLichThi"/>
              </div>
              <div v-if="!this.tokenAlowNotication" style="text-align:center;padding:10px 10% 10px 10%;">
                <h6>Ứng dụng chưa được cấp quyền để hiện thông báo. Nếu bạn đã vô tình block ứng dụng trước đó thì bạn phải tìm hiểu bật nó một các thủ công</h6>
              </div>
            </div>
            <div v-else>
                <p class="text-muted" style="margin-left:20px;margin-top:5px;">Bạn đang trong chế độ web view của Messenger. Phải sử dụng một trình duyệt bình thường thì mới bật được thông báo</p>
                <div style="text-align:center;margin:10px;">
                    <b-button type="submit" variant="primary" class="px-4" @click.prevent="chuyentrinhduyet()">Chuyển trình duyệt</b-button>
                </div>
            </div>
          </b-card-body>
        </b-card>
        <b-card no-body>
          <div slot="header" class="header-notication">
            <h5>Cập nhập dữ liệu</h5>
          </div>
          <b-card-body class="p-0">
            <div>
              <b-form style="margin:20px;">
                <p class="text-muted">Cập nhập dữ liệu điểm thi,lịch thi, thời khóa biểu...</p>
                <b-input-group class="mb-3" v-if="!sessionCheckbox">
                  <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                  <b-form-input type="password" class="form-control" placeholder="Mật khẩu tk qldt..." v-model="updateVal" style="max-width:300px;margin-right:20px;" autocomplete="current-password"/>
                  <b-button type="submit" variant="primary" class="px-4" @click.prevent="handleUpdateQldt('password')">Update</b-button>
                </b-input-group>
                <b-input-group class="mb-3" v-else>
                  <b-input-group-prepend><b-input-group-text>ASP.NET....</b-input-group-text></b-input-group-prepend>
                  <b-form-input type="text" class="form-control" placeholder="Session đăng nhập..." v-model="updateVal" style="max-width:300px;margin-right:20px;"/>
                  <b-button type="submit" variant="primary" class="px-4" @click.prevent="handleUpdateQldt('session')" >Update</b-button>
                </b-input-group>
                <b-form-checkbox-group  class="sessionCheckbox">
                    <div class="custom-control custom-checkbox">
                      <input type="checkbox" class="custom-control-input" v-model="sessionCheckbox" id="customChk1">
                      <label class="custom-control-label" for="customChk1">Sử dụng session</label>
                    </div>
                </b-form-checkbox-group>
                <b-row>
                  <PulseLoader :loading="loadingUpdate" style="padding:20px;"></PulseLoader>
                </b-row>
              </b-form>
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<style>
.setting-layout {
  flex-flow: 999;
  padding: 10px;
}
.header-notication {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.item-notication {
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #e9e9e9;
}
</style>


<script>
import { Switch as cSwitch } from "@coreui/vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import firebase from "firebase";

export default {
  name: "setting",
  components: {
    cSwitch,
    PulseLoader
  },
  data: () => {
    return {
      alowNotication: false,
      tokenAlowNotication: "",
      disableAlowNotication: false,
      disableNotificationTKB:false,
      disableNotificationLichThi:false,
      statusServer:{},
      modelActiveLichThi:null,
      modelActiveTKB:null,
      sessionCheckbox:false,
      updateVal:'',
      loadingUpdate:false,
      messaging:null
    };
  },
  computed:{
    isActiveTKBNotifi(){
      if(this.statusServer.tkb){
        return true;
      }else{
        return false;
      }
    },
    isActiveLichThiNotifi(){
      if(this.statusServer.lichthi){
        return true; 
      }else{
        return false;
      }
    },
    contextMessenger(){
        return this.$store.getters["contextMessenger"];
    }
  },
  async created() {
    if(this.contextMessenger){
        this.disableAlowNotication = true;
        return;
    }
    const messaging = firebase.messaging();
    messaging.usePublicVapidKey("BAfoDBV9lYOx8u9IBxWqeS7lplu30Q-91_ezRK0OkaZQ_Cd8Mm5HKg3M0BA7kCOIw8BGVu4U_8PUNkueO92uuO8");
    this.messaging = messaging;

    try {
      this.tokenAlowNotication = await messaging.getToken();
      if (this.tokenAlowNotication) {
        await this.saveMessagingDeviceToken();
        this.$bindAsObject(
        "statusServer",
        this.$store.state.db.ref("fcmTokens/" + this.tokenAlowNotication)
        );
        
        this.alowNotication = true;
        this.disableAlowNotication = true;
      }
    } catch (error) {
      this.$root.showError(
        "App không thể xin phép bạn bật thông báo nữa vì bạn đã từ chối trước đó. Bạn có thể thử tìm kiếm từ khóa: turn on notification in chrome"
      );
      this.disableAlowNotication = true;
    }
  },
  methods: {
    async chuyentrinhduyet() {
      const sendToBot = this.$store.state.functions.httpsCallable("sendToBot");
      await sendToBot({
        message: `Dùng môt trình duyệt bạn thích và truy cập chatbox.ptit.info`
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
    async handleUpdateQldt(type){
      try{
        const updateQldt = this.$store.state.functions.httpsCallable('updateQLDT');
        let r = null;
        this.loadingUpdate = true;
        if(type=='session'){
          r = await updateQldt({
            session:this.updateVal
          });

        }else if(type=='password'){
          r = await updateQldt({
            password:this.updateVal
          });
        }else{
          this.loadingUpdate = false;
          return this.$root.showError("Invalid type update");
        }
        const data = r.data;
        this.loadingUpdate = false;
        if(data.error){
          return this.$root.showError(data.error);
        }else{
          this.updateVal = '';
          return this.$root.showSuccess("Cập nhập dữ liệu thành công");
        }
      }catch(error){
        this.loadingUpdate = false;
        return this.$root.showSuccess(error.toString());
      }
    },
    async saveMessagingDeviceToken() {
      const db = this.$store.state.db;
      const uid = this.$store.getters["user/uid"];
      const currentToken = this.tokenAlowNotication;
      const obj = {};
      obj[currentToken] = {
        uid
      };
      this.$bindAsObject(
      "statusServer",
      this.$store.state.db.ref("fcmTokens/" + this.tokenAlowNotication)
      );

      const ref =await this.$store.state.db.ref("fcmTokens/" + this.tokenAlowNotication+"/uid").once('value');
      if(!ref.val()){
        return db.ref("/fcmTokens").update(obj);
      }
    },
    async handleNotification(val){
      if (val) {
        const messaging = this.messaging;
        try {
          if (!this.tokenAlowNotication) {
            await messaging.requestPermission();
            this.tokenAlowNotication = await messaging.getToken();
          }
          await this.saveMessagingDeviceToken();
          this.alowNotication = true;
        } catch (error) {
          this.$root.showError(error.toString());
          this.alowNotication = false;
        }
      }
    }
  },
  watch: {
    sessionCheckbox(){
      this.updateVal = "";
    },
    modelActiveTKB:async function(val,oldval){
      if(oldval===null){
        return;
      }

      this.disableNotificationTKB = true;
      if(val){
        const remote = this.$store.state.functions.httpsCallable('remote');
        try{
          const {data} = await remote({
            type:'addNotificationTKB',
            token:this.tokenAlowNotication
          });
          if(data.error){
            this.$root.showError(data.error);
          }else {
            this.$root.showSuccess("Cài đặt thông báo thành công.");
          }
        }catch(error){
          this.$root.showError(error);
        }
      }else{
        // unsubscribe
        const remote = this.$store.state.functions.httpsCallable('remote');
        try{
          const {data} = await remote({
            type:'unsubscribeFromTopicTKB',
            token:this.tokenAlowNotication
          });
          if(data.error){
            this.$root.showError(data.error);
          }else {
            this.$root.showError("Hủy thông báo thành công.");
          }
        }catch(error){
          this.$root.showError(error);
        }
      }
      this.disableNotificationTKB = false;
    },
    modelActiveLichThi:async function(val,oldval){
      if(oldval===null){
        return;
      }
      this.disableNotificationLichThi = true;
      if(val){
        const remote = this.$store.state.functions.httpsCallable('remote');
        try{
          const {data} = await remote({
            type:'addNotificationLichThi',
            token:this.tokenAlowNotication
          });
          if(data.error){
            this.$root.showError(data.error);
          }else {
            this.$root.showSuccess("Cài đặt thông báo thành công.");
          }
        }catch(error){
          this.$root.showError(error);
        }
      }else{
        // unsubscribe
        const remote = this.$store.state.functions.httpsCallable('remote');
        try{
          const {data} = await remote({
            type:'unsubscribeFromTopicLichThi',
            token:this.tokenAlowNotication
          });
          if(data.error){
            this.$root.showError(data.error);
          }else {
            this.$root.showError("Hủy thông báo thành công.");
          }
        }catch(error){
          this.$root.showError(error);
        }
      }
      this.disableNotificationLichThi = false;
    }
  }
};
</script>
