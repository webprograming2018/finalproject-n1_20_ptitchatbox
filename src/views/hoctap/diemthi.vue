<template lang="html">
  <div style="flex-grow:999;overflow-y: scroll;background-color:#f4f4f4;">
    <div style="margin:20px 20px 20px 10px;" class="header-diem-thi">
      <h3 style="text-align:left;color: #5b5777;margin-top:8px;">Điểm thi</h3>
        <div>
        <b-dropdown id="ddown-header" :text="getCurrentHK" class="m-2" size="sm">
            <b-dropdown-item :active="hk==hocki" v-for="(hk,key) in getMasoCacHK" :key="key" @click="setHocKi(hk)">HK {{hk}}</b-dropdown-item>
        </b-dropdown>
        </div>

    </div> 
    
    <div style="overflow-x:auto;color:#5b5777;margin-left:20px;">
        <table id="diemthi" >
        
            <tr v-if="getDiemThi.hidden">
            <th>STT</th>
            <th>MSMH</th>
            <th v-bind:class="{hiddenTenMh:true,antenmonhoc2:antenmonhoc}">Tên môn học</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TC}">TC</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.CC}">CC</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.KT}">KT</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TH}">TH</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.BT}">BT</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.thiL1}">Thi</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TB}">TB</th>
            <th v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TK}">TK</th>
            </tr>
            <h4 v-else style="text-align:center;margin-top:50px;">
            Không tìm thấy điểm thi.
            </h4>
            <tr v-for="(e,key) in getDiemThi.diemthi" :key="key">
            <td >{{e[0]}}</td>
            <td>{{e[1]}}</td>
            <td nowrap v-bind:class="{hiddenTenMh:true,antenmonhoc2:antenmonhoc}">{{e[2]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TC}">{{e[3]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.CC}">{{e[4]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.KT}">{{e[5]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TH}">{{e[6]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.BT}">{{e[7]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.thiL1}">{{e[8]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TB}">{{e[9]}}</td>
            <td v-bind:class="{hiddenThuocTinh:getDiemThi.hidden.TK}">{{e[10]}}</td>
            </tr>
        
        </table>
    </div>
        <!--
        <vs-row vs-w="12">
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="10">
            <div v-if="hidden" style="margin:5px" class="antenmonhoc">
                <vs-checkbox v-model="antenmonhoc">Hiện tên môn học</vs-checkbox>
            </div>
            </vs-col>
        </vs-row>
        -->
    <div style="margin-left:25px;margin-top:5px;">
        <b-form-checkbox v-model="antenmonhoc" class="antenmonhoc">
            Hiện tên môn học
        </b-form-checkbox>
    </div>

    <div style="margin-top:50px;margin-left:20px;">
        <h6 v-if="getAllDiemGraph">Biểu đồ biểu diễn điểm thi của học kì ( trục tung biểu diễn số lượng sv )</h6>
        <h6 v-if="getAllDiemGraph">Tên cột ELE1319(186) thì số 186 là tổng số sinh viên có điểm thi môn học ELE1319</h6>
        <h6 v-if="source==='origin'">Nguồn dữ liệu: Là điểm của những người đã đăng nhập vào chatbox.</h6>
        <h6 v-if="source==='other'">Nguồn dữ liệu: Dữ liệu thống kê là điểm điểm toàn bộ sinh viên.</h6>
        <LineChart v-if="getAllDiemGraph" :datasets="getAllDiemGraph" :styles="{height: '100%', width:'90%', position: 'relative'}">   
        </LineChart>
        <h4 v-if="!isLoading&&!getAllDiemGraph" style="text-align:center;margin:10px;color: #5b5777;">Không có biểu đồ.</h4>
        <ul class="centerx" v-if="getAllDiemGraph">
            <li style="float:left;margin:20px;list-style-type:none;">
                <b-form-checkbox v-model="graphdiemthi">
                    Biểu đồ điểm thi (Thử nghiệm)
                </b-form-checkbox>
            </li>
        </ul>
        
        <PulseLoader v-if="isLoading" style="text-align:center;"></PulseLoader>
    </div>


  </div>

</template>

<style>
.header-diem-thi{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}


.bar-chart {
  height: 500 !important;
}
@media only screen and (max-width: 1040px) {
  .hiddenTenMh {
    display: none;
  }
  .antenmonhoc {
    display: block !important;
  }
  .antenmonhoc2 {
    display: table-cell !important;
  }
}

.antenmonhoc {
  display: none;
}

.hiddenThuocTinh {
  display: none !important;
}
#diemthi {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  word-wrap: normal;
  padding: 15px !important;
  width: 90%;
}

#diemthi td,
#diemthi th {
  border: 1px solid #dfe2e5;
  padding: 8px;
}

#diemthi td {
  background: #fff;
}
#diemthi th {
  padding: 7px;
  text-align: left;
  border: 1px solid #dfe2e5;
  font-size: 0.8rem !important;
  background: #fafafa;
  color: #5b5777;
}
</style>

<script>
import LineChart from "../other/lineChart";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
export default {
  components: {
    LineChart,
    PulseLoader
  },
  data: () => ({
    diemthi: [],
    hocki: "",
    hidden: {},
    antenmonhoc: false,
    typeGraph: "THI",
    dataGraph: [],
    graphdiemthi: false,
    isLoading:true,
    source:''
  }),
  computed: {
    getDiemThi() {
      const result = [];
      const bangdiem = this.$store.getters["user/user"].bangdiem;
      const i = bangdiem[this.hocki];
      let k = 1;
      const hidden = {
        maMH: true,
        tenMH: true,
        TC: true,
        CC: true,
        KT: true,
        TH: true,
        BT: true,
        thiL1: true,
        TK10: true,
        TKCH: true,
        TB: true
      };
      let check = false;
      i.forEach(item => {
        check = true;

        hidden["maMH"] =
          hidden["maMH"] === true ? (item[1] ? false : true) : false;
        hidden["tenMH"] =
          hidden["tenMH"] === true ? (item[2] ? false : true) : false;
        hidden["TC"] =
          hidden["TC"] === true ? (item[3] ? false : true) : false;
        hidden["CC"] =
          hidden["CC"] === true ? (item[9] ? false : true) : false;
        hidden["KT"] =
          hidden["KT"] === true ? (item[10] ? false : true) : false;
        hidden["TH"] =
          hidden["TH"] === true ? (item[11] ? false : true) : false;
        hidden["BT"] =
          hidden["BT"] === true ? (item[12] ? false : true) : false;
        hidden["thiL1"] =
          hidden["thiL1"] === true ? (item[13] ? false : true) : false;
        hidden["TK10"] =
          hidden["TK10"] === true ? (item[15] ? false : true) : false;
        hidden["TKCH"] =
          hidden["TKCH"] === true ? (item[16] ? false : true) : false;


        result.push([
          k++,
          item[1] ? item[1] : "",
          item[2] ? item[2] : "",
          item[3] ? item[3] : "",
          item[9] ? item[9] : "",
          item[10] ? item[10] : "",
          item[11] ? item[11] : "",
          item[12] ? item[12] : "",
          item[13] ? item[13] : "",
          item[15] ? item[15] : "",
          item[16] ? item[16] : ""
        ]);
      });

      return {
          diemthi:result,
          hidden:check ? hidden : false
      };
    },
    getCurrentHK() {
      if (!this.hocki) return "";
      const h = this.hocki.split("-");

      return `Học kì ${h[0]} năm học ${h[1]}-${h[2]}`;
    },
    getMasoCacHK() {
      const bangdiem = this.$store.getters["user/user"].bangdiem;
      if(!bangdiem) return [];
      const result = [];
      for(let i in bangdiem){
          result.push(i);
      }
      result.sort((a,b)=>{
          const _a = a.split('-').map((e)=>{
            return Number(e);
          });
          const ss_a = _a[2]*10+_a[0];
          const _b = b.split('-').map((e)=>{
            return Number(e);
          });
          const ss_b = _b[2]*10+_b[0];
          return - ss_a + ss_b;
      })
      return result;
    },
    getAllDiemGraph() {
      if (this.dataGraph.length == 0) {
        return null;
      }
      const result = {};
      //debugger;
      if (!this.graphdiemthi) {
        result["labels"] = ["F", "D", "D+", "C", "C+", "B", "B+", "A", "A+"];
        result["datasets"] = [];
        const color = [
          "#065535",
          "#ffa500",
          "#0000ff",
          "#800000",
          "#800080",
          "#fa8072",
          "#003366",
          "#f6546a",
          "#ff6666",
          "#008000",
          "#660066"
        ];
        let t = 0;

        for (const e of this.dataGraph) {
          const SL = e.TKCH;
          let l = 0;
          for(const i in SL){
            l += SL[i];
          }
          const data = {
            label: e.maMH+ `(${ l})`,
            backgroundColor: `${color[t++]}`,
            data: [
              SL["F"] ? SL["F"] : 0,
              SL["D"] ? SL["D"] : 0,
              SL["D+"] ? SL["D+"] : 0,
              SL["C"] ? SL["C"] : 0,
              SL["C+"] ? SL["C+"] : 0,
              SL["B"] ? SL["B"] : 0,
              SL["B+"] ? SL["B+"] : 0,
              SL["A"] ? SL["A"] : 0,
              SL["A+"] ? SL["A+"] : 0
            ]
          };
          result.datasets.push(data);
        }
      } else {
        const r = [];
        const ignore = [];
        for (const e of this.dataGraph) {
          const SL = e.THI;

          for (const j in SL) {
            //if(j==10) debugger;
            if (parseFloat(j) > 10) {
              ignore.push(e.maMH);
              break;
            }
          }
          if (ignore.includes(e.maMH)) {
            continue;
          }
          for (const j in SL) {
            //if(j==10) debugger;
            if (!r.includes(j)) {
              r.push(j);
            }
          }
          debugger;
        }
        r.sort((a, b) => parseFloat(a) - parseFloat(b));
        result["labels"] = r;
        result["datasets"] = [];
        const color = [
          "#065535",
          "#ffa500",
          "#0000ff",
          "#800000",
          "#800080",
          "#fa8072",
          "#003366",
          "#f6546a",
          "#ff6666",
          "#008000",
          "#660066"
        ];
        let t = 0;
        for (const e of this.dataGraph) {
          const SL = e.THI;
          if (ignore.includes(e.maMH)) {
            continue;
          }
          let l = 0;
          for(const i in SL){
            l += SL[i];
          }

          const data = [];
          for (const i in r) {
            data[i] = 0;
          }
          console.log(data);
          for (const i in SL) {
            //debugger;
            for (let j = 0; j < r.length; j++) {
              //debugger;
              //console.log(r[j]);
              //console.log(i);
              if (r[j] == i) {
                data[j] = SL[i];
                break;
              }
            }
          }
          console.log(data);
          const _data = {
            label: e.maMH+`(${l})`,
            backgroundColor: `${color[t++]}`,
            data: data
          };
          //debugger;
          result.datasets.push(_data);
        }
      }
      //debugger;
      return result;
    }
  },
  async created() {
    debugger
    const bangdiem = this.$store.getters["user/user"].bangdiem;
    for(let i in bangdiem){
        this.hocki = i;
    }
    this.initGraph();

  },
  methods: {
    setHocKi(hk) {
        this.hocki = hk;
        this.initGraph();
    },
    initGraph(){
      while (this.dataGraph.length > 0) {
        this.dataGraph.pop();
      }

    },
    getTenHK(item) {
      const k = item.split("-");
      return `HK ${k[0]}. ${k[1]}-${k[2]}`;
    },
    async getDiemGraph(maMH) {

      const remoteFun = this.$store.state.functions.httpsCallable('remote');
      const r = await remoteFun({
        type: "getalldiemthifrommonhocs",
        hk: this.hocki,
        mhs: maMH
      });

      this.source = r.data.source;
      r.data = r.data.data;

      debugger

      

      const result = [];
      for (const g in r.data) {
        if(r.data[g].err){
          continue;
        }
        const THI = {};
        const TKCH = {};
        for (const e of r.data[g]) {
          if(e.TKCH=="H"){
            continue;
          }
          if (typeof e.thiL2 == "number") {
            THI[e.thiL2] = THI[e.thiL2] ? 1 : THI[e.thiL2] + 1;
          } else if (typeof e.thiL1 == "number") {
            THI[e.thiL1] = THI[e.thiL1] ? THI[e.thiL1] + 1 : 1;
          }

          TKCH[e.TKCH] = TKCH[e.TKCH] ? TKCH[e.TKCH] + 1 : 1;
        }
        result.push({ THI, TKCH, maMH:maMH[g]})
      }
      
      return result;
    }
  },

  watch: {
    hocki: async function(val) {
      debugger
      const bangdiem = this.$store.getters["user/user"].bangdiem;
      if(!bangdiem||!val){
          return;
      }
      const diemHk = bangdiem[val];
      if (!diemHk) return;
      
      const _t = [];

      for (let i in diemHk) {
        //const q = await this.getDiemGraph(val[i].maMH);
        //if (!q) continue;
        _t.push(diemHk[i][1]);
      }
      
      this.isLoading = true;
      const arr = await this.getDiemGraph(_t);
      this.isLoading = false;

      while (this.dataGraph.length > 0) {
        this.dataGraph.pop();
      }

      while (arr.length > 0) {
        this.dataGraph.push(arr.pop());
      }
    }
  }
};
</script>