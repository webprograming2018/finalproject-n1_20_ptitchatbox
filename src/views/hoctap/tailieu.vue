<template>
  <div class="body-tailieu" v-if="getDKMH">
    <template v-for="(item,key) in getList">
          <div class="tab-pane-tailieu" variant="primary" :key="key+'pane'">
      <h5>{{item.tenMh}}</h5>
      <b-button
        style="margin-left:auto;max-height: 25px;margin-bottom: auto;margin-top: auto;"
        v-b-toggle="'collapse'+key"
        variant="danger"
        @click="showWarningUploadDoc(item.file.length)"
        
      >
        <i class="fas fa-file fa-lg"></i>&#160;
        <b-badge variant="warning" :style="{position: 'static'}">{{item.file.length}}</b-badge>
      </b-button>
      <b-button variant="link" @click.prevent="showModalUpload(item.msmh)">
        <i class="fas fa-cloud-upload-alt fa-lg"></i>
      </b-button>
    </div>
    <b-collapse :id="'collapse'+key" :key="key+'collapse'">
      <div class="row" v-for="(file,key2) in item.file" :key="key+key2">
        <div class="cell -file">
          <i class="fa fa-file" aria-hidden="true"></i>
          <div class="inner">
            <a href="#" class="filename">{{file.title||'N/A'}}</a>
            <small class="details">
              <span class="detail -filesize">
                <i class="fa fa-hdd-o" aria-hidden="true"></i> {{file.meta.size/1000}}kb
              </span>
              <span class="detail -updated">
                <i class="fa fa-clock-o" aria-hidden="true"></i> Updated bởi {{file.uploaderName}}
              </span>
            </small>
          </div>
          <b-button variant="link" style="margin-left:auto;" @click="downloadFile(file.url)">
            <i class="fas fa-arrow-alt-circle-down fa-lg downloadbtn"></i>
          </b-button>

          <b-button variant="link" v-if="file.uploader===uid" @click.prevent="invisiableDoc(file.id,item.maLop,file.title)">
            <i class="fas fa-trash-alt fa-lg deleteDoc"></i>
          </b-button>

          
        </div>
      </div>
    </b-collapse>
    </template>
    <b-modal
      ref="myModalRef"
      body-class="modal-upload-tailieu"
      hide-footer
      centered
      title="Using Component Methods"
      hide-header
      @hidden="handleModalHidden"
    >
      <div class="upload">
        <div class="upload-files">
          <b-button variant="link" style="position:absolute;right:0;" @click.prevent="hideModal()">
            <i class="fas fa-times fa-lg"></i>
          </b-button>
          <header>
            <p>
              <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
              <span class="up">up</span>
              <span class="load">load</span>
              <br>
              <span class="load" style="font-size:20px;">{{getCurentTenMh}}</span>
            </p>
            
          </header>
          <div :class="{body:true,hidden:file!==null}" id="drop">
            <i class="far fa-file-alt pointer-none" aria-hidden="true"></i>
            <p class="pointer-none">
              <b>Kéo và thả</b> file vào đây
              <br>hoặc
              <a href="#" @click="trigerFile">chọn file</a> để bắt đầu upload
            </p>
            <input type="file" multiple="multiple" @change.prevent="handleFileSelect">
          </div>
          <footer :class="{hasFiles:file!==null}">
            <div class="divider">
              <span>
                <h3>FILES</h3>
              </span>
            </div>
            <div class="list-files" v-if="file!==null">
              <div class="file file--0">
                <div class="name">
                  <span>{{file.name}}</span>
                </div>
                <div :class="{progress:true,active:!uploading}"></div>
                <div :class="{done:true,anim:uploading}">
                  <a href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
                        <g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z">
                    </path></g></svg>
                  </a>
                </div>
              </div>
            </div>
            <div
              v-if="file!==null&&uploading"
              style="position: absolute;left: 0;right: 0;bottom: 20px;"
            >
              <b-form-input
                type="text"
                placeholder="Nhập vào tiêu đề cho file..."
                style="max-width:250px;margin:auto;margin-bottom:10px;"
                v-model="titelDoc"
              ></b-form-input>
              <button :class="{importar:true,active:file!==null}" @click="handleSubmitFile">Xong</button>
            </div>
          </footer>
        </div>
      </div>
    </b-modal>
  </div>
  <div v-else style="text-align:center;margin:20px;">
      <h5>Chúng tôi chưa cập nhập được dữ liệu đăng kí môn học của bạn</h5>
  </div>    
</template>

<style>
.downloadbtn:hover {
  color: #4caf50;
}
.deleteDoc:hover{
  color: red!important;
}
.modal-upload-tailieu {
  padding: 0 !important;
}
.body-tailieu {
  padding: 20px;
}
.tab-pane-tailieu {
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
  border: 1px solid #c8ced3;
  padding: 10px;
  background-color: #f0f3f5 !important;
  margin-bottom: 10px;
  display: block;
  text-decoration: none !important;
  display: flex;
  flex-direction: row;
}
.tab-pane-tailieu h4 {
  margin: 0;
}
.tab-pane-tailieu h6 {
  margin: auto;
  color: red;
}
</style>
<style lang="scss">
$hoverColor: #bada55;
$skin: #4db6ac;
button {
  border: none;
  text-decoration: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-sizing: content-box;
}

.row {
  display: flex;
  width: 100%;
  margin-bottom: 0.375rem;

  &:hover .cell,
  &:focus-within .cell,
  &:active .cell {
    background: rgba($hoverColor, 0.7);
    border-color: lighten($hoverColor, 20);
  }
}

.cell {
  background: #fff;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 96ms ease, box-shadow 48ms ease,
    outline 48ms ease;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  outline: 1px solid rgba(255, 255, 255, 0.001);

  &:hover,
  &:focus,
  &:focus-within {
    transition: 48ms ease;
    box-shadow: 0 0 0 1px #fff inset;
    outline: 1px solid #fff;
  }

  &.-file {
    flex: 1;
    display: flex;
    position: relative;
    margin-left: 25px;
    > i {
      font-size: 2rem;
      vertical-align: middle;
      line-height: 2.5rem;
      margin-right: 0.75rem;
    }

    a {
      text-decoration: none;
      color: #222;
      font-weight: bold;
    }
  }

  &.-action {
    display: block;
    margin-left: 0.1875rem;
    width: 4.5rem;
    font-size: 0.65rem;
    color: #586069;
    text-transform: uppercase;
    text-align: center;
    padding: 0.75rem 0;

    .label {
      transition: opacity 96ms ease;
      transition-delay: 24ms;
    }

    &:not(:hover):not(:focus) {
      .label {
        opacity: 0;
        transition: opacity 48ms ease;
        transition-delay: 0;
      }

      i {
        transform: translateY(0.25em);
        transition: transform 96ms ease;
      }
    }

    i {
      font-size: 1.75rem;
      line-height: 2rem;
      color: #000;
      display: block;
      transition: 48ms ease;
    }
  }
}

.inner {
  border-left: 1px solid #999;
  padding-left: 0.75rem;
}

.details {
  margin: 0.375rem 0;
  display: block;
}

.detail {
  margin-right: 0.75em;
  color: #586069;
  font-size: 0.8rem;

  i {
    font-size: inherit;
    line-height: inherit;
    margin-right: 0.1em;
  }
}

.-dropzone {
  border: 0.1835rem dashed #888;
  box-sizing: border-box;
  border-radius: 0.375rem;
  padding: 2px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 5rem;

  i {
    margin: 1rem;
    font-size: 1.5rem;
    color: #999;
    text-shadow: 1px 1px 0 #ccc;
  }

  &:hover i,
  &:not(:hover) .drop-info {
    display: none;
  }

  &:hover {
    border-color: #555;
  }
}

.drop-info {
  font-size: 0.8rem;
  text-align: center;
  color: #555;

  strong {
    font-size: 1.375rem;
    color: #333;
    position: relative;

    &::before,
    &::after {
      display: block;
      width: 3rem;
      height: 2px;
      background: #555;
      content: "";
      position: absolute;
      top: 50%;
    }

    &::before {
      right: 100%;
      margin-right: 0.375rem;
    }

    &::after {
      left: 100%;
      margin-left: 0.375rem;
    }
  }
}

.upload {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 445px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(black, 0.2);
  padding-bottom: 20px;
  background: #fff;
  animation: fadeup 0.5s 0.5s ease both;
  transform: translateY(20px);
  opacity: 0;
  .upload-files {
    flex-grow: 999;
    position: relative;
    header {
      background: $skin;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      text-align: center;
      p {
        color: #fff;
        font-size: 40px;
        margin: 0;
        padding: 50px 0;
        i {
          transform: translateY(20px);
          opacity: 0;
          font-size: 30px;
          animation: fadeup 0.5s 1s ease both;
        }
        .up {
          font-weight: bold;
          transform: translateX(-20px);
          display: inline-block;
          opacity: 0;
          animation: faderight 0.5s 1.5s ease both;
        }
        .load {
          display: inline-block;
          font-weight: 100;
          transform: translateX(-20px);
          opacity: 0;
          animation: faderight 1s 1.5s ease both;
        }
      }
    }
    .body {
      text-align: center;
      padding: 50px 0;
      padding-bottom: 30px;
      &.hidden {
        display: none;
      }
      input {
        visibility: hidden;
      }
      i {
        font-size: 65px;
        color: lightgray;
      }
      p {
        font-size: 14px;
        padding-top: 15px;
        line-height: 1.4;
        b,
        a {
          color: $skin;
        }
      }
      &.active {
        border: dashed 2px $skin;
        i {
          box-shadow: 0 0 0 -3px #fff, 0 0 0 lightgray, 0 0 0 -3px #fff,
            0 0 0 lightgray;
          animation: file 0.5s ease both;
        }
        @keyframes file {
          50% {
            box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray,
              -8px 8px 0 -3px #fff, -8px 8px 0 lightgray;
          }
          75%,
          100% {
            box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray,
              -16px 16px 0 -3px #fff, -16px 16px 0 lightgray;
          }
        }
        .pointer-none {
          pointer-events: none;
        }
      }
    }
    footer {
      width: 100%;
      margin: 0 auto;
      height: 0;
      .divider {
        margin: 0 auto;
        width: 0;
        border-top: solid 4px darken($skin, 3.5%);
        text-align: center;
        overflow: hidden;
        transition: width 0.5s ease;
        span {
          display: inline-block;
          transform: translateY(-25px);
          font-size: 12px;
          padding-top: 8px;
        }
      }
      &.hasFiles {
        height: auto;
        .divider {
          width: 100%;
          span {
            transform: translateY(0);
            transition: transform 0.5s 0.5s ease;
          }
        }
      }
      .list-files {
        width: 320px;
        margin: 0 auto;
        margin-top: 15px;
        padding-left: 5px;
        text-align: center;
        overflow-x: hidden;
        overflow-y: auto;
        max-height: 210px;
        &::-webkit-scrollbar-track {
          background-color: rgba(lightgray, 0.25);
        }
        &::-webkit-scrollbar {
          width: 4px;
          background-color: rgba(lightgray, 0.25);
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba($skin, 0.5);
        }
        .file {
          width: 300px;
          min-height: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          opacity: 0;
          animation: fade 0.35s ease both;
          .name {
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            width: 80px;
            text-align: left;
          }
          .progress {
            width: 175px;
            height: 5px;
            border: solid 1px lightgray;
            border-radius: 2px;
            background: linear-gradient(
                to left,
                rgba($skin, 0.2),
                rgba($skin, 0.8)
              )
              no-repeat;
            background-size: 100% 100%;
            &.active {
              animation: progress 30s linear;
            }
          }

          @keyframes progress {
            from {
              background-size: 0 100%;
            }
            to {
              background-size: 100% 100%;
            }
          }

          .done {
            cursor: pointer;
            width: 40px;
            height: 40px;
            background: $skin;
            border-radius: 50%;
            margin-left: -10px;
            transform: scale(0);
            position: relative;
            &:before {
              content: "View";
              position: absolute;
              top: 0;
              left: -5px;
              font-size: 24px;
              opacity: 0;
            }
            &:hover:before {
              transition: all 0.25s ease;
              top: -30px;
              opacity: 1;
            }
            &.anim {
              animation: done1 0.5s ease forwards;
              #path {
                animation: done2 2.5s 0.5s ease forwards;
              }
            }
            #path {
              stroke-dashoffset: 7387.59423828125;
              stroke-dasharray: 7387.59423828125 7387.59423828125;
              stroke: #fff;
              fill: transparent;
              stroke-width: 50px;
            }
          }
          @keyframes done2 {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes done1 {
            50% {
              transform: scale(0.5);
              opacity: 1;
            }
            80% {
              transform: scale(0.25);
              opacity: 1;
            }
            100% {
              transform: scale(0.5);
              opacity: 1;
            }
          }
        }
      }
      .importar {
        outline: none;
        margin: auto;
        border: solid 1px $skin;
        color: $skin;
        background: transparent;
        padding: 8px 15px;
        font-size: 12px;
        border-radius: 4px;
        font-family: Roboto;
        line-height: 1;
        cursor: pointer;
        transform: translateY(15px);
        opacity: 0;
        visibility: hidden;
        margin-left: calc(50% - 40px);
        &.active {
          transition: transform 0.5s 1.5s ease, opacity 0.5s 1.5s ease,
            background;
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        &:hover {
          background: $skin;
          color: #fff;
        }
      }
    }
  }
  @keyframes fadeup {
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes faderight {
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes fade {
    to {
      opacity: 1;
    }
  }
  @media (max-width: 400px) {
    width: 100%;
    height: 100%;
  }
}
</style>


<script>

import firebase from "firebase";

export default {
  data() {
    return {
      file: null,
      uploading: false,
      fileUploaded: {},
      selectMH:null,
      titelDoc:'',
      resultUpload:null,
      tailieu:null,
      uid:null
    };
  },
  computed: {
    getCurentTenMh(){
      if(!this.selectMH){
        return '';
      }
      const dkmh = this.$store.getters["user/user"].dkmh;
      return dkmh[this.selectMH].tenMh
    },
    getList() {
      const dkmh = this.$store.getters["user/user"].dkmh;
      const uploadFile = this.fileUploaded;
      const result = [];
      for (let i in dkmh) {
        const obj = {
          tenMh: dkmh[i].tenMh,
          msmh: i,
          maLop:dkmh[i].maLop.replace('-','')
        };
        if (uploadFile[i]) {
          result.push({
            ...obj,
            file: uploadFile[i]
          });
        } else {
          result.push({
            ...obj,
            file: []
          });
        }
      }
      return result;
    },
    getDKMH(){
        return this.$store.getters["user/user"].dkmh;
    }
  },
  created() {
    //bind data
    const dkmh = this.$store.getters["user/user"].dkmh;
    this.uid = this.$store.getters["user/fbuser"].uid;
    for(let i in dkmh){
      const maLop = dkmh[i].maLop.replace('-','');
      setTimeout(()=>{
        this.$bindAsObject(
        "tailieu",
        this.$store.state.db.ref("tailieu/" + maLop)
        );
      },0);
    }
  },
  methods: {
    showWarningUploadDoc(length){
      if(length==0){
        return this.$root.showError("Môn học này không có tài liệu nào. Hãy upload tài liệu vào đây để mọi người trong lớp của bạn có thể xem nó");
      }
    },
    downloadFile(url){
      const link = document.createElement("a");
      link.href = url;
      link.target='_blank';
      link.click();
    },
    async invisiableDoc(id,maLop,name){
      if(!confirm(`Xác nhận xóa file: ${name} ?`)){
        return;
      }
      try{
        const db = this.$store.state.db;
        await db.ref('tailieu/'+maLop+'/'+id).update({
          visible:false
        });
      }catch(error){
        return this.$root.showError(error.toString());
      }
    },
    handleModalHidden(){
      this.file = null;
      this.uploading = false;
      this.titelDoc = '';
      this.resultUpload = null;
    },
    async handleSubmitFile(){
      try{
        if(!this.titelDoc){
          throw new Error("Bạn phải nhập tiêu đề cho tài liệu.")
        }
        const dkmh = this.$store.getters["user/user"].dkmh;
        const mh = dkmh[this.selectMH];
        const maLop = mh.maLop.replace('-','');
        const uid = this.$store.getters["user/fbuser"].uid;
        const nameUserUpload = this.$store.getters["user/user"].ten_sv;
        const cbgv = mh.CBGV[0];

        const db = this.$store.state.db;

        const obj = {
          ...this.resultUpload,
          uploader:uid,
          uploaderName:nameUserUpload,
          cbgv:cbgv,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          visible:true,
          msmh:this.selectMH,
          title:this.titelDoc
        };

        await db.ref('tailieu/'+maLop).push(obj);
        
        this.hideModal();
        return this.$root.showSuccess("Tài liệu của bạn được upload thành công.");
      }catch(error){
        return this.$root.showError(error.toString());
      }

    },
    trigerFile() {
      document.querySelector("input[type=file]").click();
    },
    showModalUpload(mh) {
      this.selectMH = mh;
      this.$refs.myModalRef.show();
    },
    hideModal() {
      this.$refs.myModalRef.hide();
    },
    async handleFileSelect(evt) {
      this.file = evt.target.files[0]; // FileList object

      //upload file
      const dkmh = this.$store.getters["user/user"].dkmh;
      const mh = dkmh[this.selectMH];
      const maLop = mh.maLop.replace('-','');

      this.resultUpload = await this.uploadFile(`/TAILIEU/${maLop}/` + Math.random().toString(36).substring(7)+this.file.name, this.file);

      this.uploading = true;

      document.querySelector("input[type=file]").value = "";
    },
    async uploadFile(filePath, file) {

      return firebase
        .storage()
        .ref(filePath)
        .put(file)
        .then(async function(fileSnapshot) {
          const [url, meta] = await Promise.all([
            fileSnapshot.ref.getDownloadURL(),
            fileSnapshot.ref.getMetadata()
          ]);
          return {
            url,
            meta:{
              size:meta.size,
              name:meta.name,
              updated:meta.updated,
              fullPath:meta.fullPath,
              bucket:meta.bucket
            }
          };
        });
    }
  },
  watch:{
    tailieu:function(val){
      if(!val){
        return;
      }
      const result = JSON.parse(JSON.stringify(this.fileUploaded));
      for(let idTaiLieu in val){
        const tailieu = val[idTaiLieu];
        if(tailieu==null||!tailieu.msmh){
          continue
        }
        const msmh = tailieu.msmh;
        if(!result[msmh]){
          result[msmh] = [];
          if(!tailieu.visible){
            continue;
          }
          result[msmh].push({
            ... tailieu,
            id:idTaiLieu
          })
        }else{
          if(result[msmh].find(item=>item.id===idTaiLieu)){
            if(!tailieu.visible){
              result[msmh] = result[msmh].filter(item=>item.id!==idTaiLieu);
            }else{
              continue;
            }
          }else{
            if(!tailieu.visible){
              continue;
            }
            result[msmh].push({
              ... tailieu,
              id:idTaiLieu
            })
          }
        }
      }
      for(let i in result){
        result[i].sort((a,b)=>{
          return b.timestamp - a.timestamp;
        })
      }
      this.fileUploaded = result;
    }
  },
  mounted(){
    const $ = document.querySelector.bind(document);
    const App = {};
    App.init = (function() {
      $("#drop").ondragleave = function(evt) {
        $("#drop").classList.remove("active");
        evt.preventDefault();
      };
      $("#drop").ondragover = $("#drop").ondragenter = function(evt) {
        $("#drop").classList.add("active");
        evt.preventDefault();
      };
      $("#drop").ondrop = function(evt) {
        $("input[type=file]").files = evt.dataTransfer.files;
        $("footer").classList.add("hasFiles");
        $("#drop").classList.remove("active");
        evt.preventDefault();
      };
    })();
  }
};
</script>