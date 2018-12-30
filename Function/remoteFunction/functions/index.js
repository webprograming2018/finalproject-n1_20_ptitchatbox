const functions = require("firebase-functions");
const mysql = require("./mysql");
const remote = require("./remote");
const diemthi = require("./diemthi");
const {db} = require("./firebase");

const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "128MB"
};

/*diemthi.getAllDiemFromMonhocs('GDUELIvH2xYOV4BH2nKjcKB4jOF3','2-2016-2017',['INT1336']).then((data)=>{
  debugger
})*/

exports.remote = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const linking = await db.ref("linkid/"+uid).once("value");
    const idUser = linking.val();
    if(!idUser){
      return Promise.resolve({
        error:"Không tìm thấy idUser sau khi linking"
      })
    }

    const type = data.type;
    console.log(`Call remote function: `+type);
    try{
      if(type==="sendMessage"){
        const r = await remote.sendMessage(idUser,data);
        return r;
      }else if(type==="addBasicInfo"){
        const r = await remote.addInfo.addBasicInfo(uid,idUser,data.att,data.conversation_id);
        return r;
      }else if(type==="addMark"){
        const r = await remote.addInfo.addMark(uid,idUser,data.msmh,data.conversation_id);
        return r;
      }else if(type==="removeBasicInfo"){
        const r = await remote.addInfo.removeBasicInfo(uid,idUser,data.att,data.conversation_id);
        return r;
      }else if(type==="removeMark"){
        const r = await remote.addInfo.removeMark(uid,idUser,data.msmh,data.conversation_id);
        return r;
      }else if(type==="addBasicInfoProfile"){
        const r = await remote.addInfoProfile.addBasicInfo(uid,idUser,data.att,data.typeProfile);
        return r;
      }else if(type==="addMarkProfile"){
        const r = await remote.addInfoProfile.addMark(uid,idUser,data.msmh,data.typeProfile);
        return r;
      }else if(type==="removeBasicInfoProfile"){
        const r = await remote.addInfoProfile.removeBasicInfo(uid,idUser,data.att,data.typeProfile);
        return r;
      }else if(type==="removeMarkProfile"){
        const r = await remote.addInfoProfile.removeMark(uid,idUser,data.msmh,data.typeProfile);
        return r;
      }else if(type==='getalldiemthifrommonhocs'){
        const r = await diemthi.getAllDiemFromMonhocs(idUser,data.hk,data.mhs)
        return r;
      }else if(type==='searchSV'){
        const r = await diemthi.searchSV(data.query)
        return r;
      }else if(type==='saveconversation'){
        const r = await remote.saveConversation(uid)
        return r;
      }else if(type==='addNotificationTKB'){
        const r = await remote.addNotification.addNotificationTKB(idUser,data.token);
        return r;
      }else if(type==='unsubscribeFromTopicTKB'){
        const r = await remote.addNotification.unsubscribeFromTopicTKB(idUser,data.token);
        return r;
      }else if(type==='addNotificationLichThi'){
        const r = await remote.addNotification.addNotificationLichThi(idUser,data.token);
        return r;
      }else if(type==='unsubscribeFromTopicLichThi'){
        const r = await remote.addNotification.unsubscribeFromTopicLichThi(idUser,data.token);
        return r;
      }
    }catch(ex){
      return Promise.resolve({
        error:String(ex)
      })
    }
});


function search(query){
	

}

