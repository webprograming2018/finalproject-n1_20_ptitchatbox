const {db,admin} = require("../firebase");

module.exports = saveConversation;

//saveConversation('mwpEYypqnTUmjJXOUJWlPr6zG9J2');
//saveConversation('ftoS5KVs7nh1d1hjhjfenULhVsK2');
async function saveConversation(uid){
    const _conversation_id = await db.ref('andanh/'+uid+"/conversation_id").once('value');
    const conversation_id = _conversation_id.val();
    if(!conversation_id){
        throw new Error("Có vẻ cuộc trò chuyện không tồn tại");
    }
    const filterUser =await  db.ref("andanh/").orderByChild('conversation_id').equalTo(conversation_id).once('value');
    const task = [];
    let uid2 = '';
    filterUser.forEach((item)=>{
        if(item.key!==uid){
            uid2 = item.key;
        }
        task.push(db.ref("linkid/"+item.key).once('value'));
    })
    const data = await Promise.all(task);

    const uniqueKey = getUniqueKey(uid,uid2);
    const filterConversation =await  db.ref("room_names/").orderByChild('uniquekey').equalTo(uniqueKey).once('value');
    
    if(filterConversation.val()){
        throw new Error('Bạn đã lưu một cuộc trò chuyện với người này rồi');
    }

    const room_info_snap = await db.ref('room_names/'+conversation_id).once('value');
    const room_info = room_info_snap.val();
    const savepending = room_info.savepending;

    if(!savepending || Object.keys(savepending).length!==2){
        throw new Error('Phải có 2 người đồng ý thì mới lưu được');
    }
    for(let i in savepending){
        if(!savepending[i]){
            throw new Error('Phải có 2 người đồng ý thì mới lưu được');
        }
    }


    const taskUpdate = []
    data.forEach((item)=>{
        const idUser = item.val();
        const obj = {};
        obj[conversation_id] =  {
            timestamp:admin.database.ServerValue.TIMESTAMP
        };
        taskUpdate.push(db.ref('conversation/'+idUser+"/friends").update(obj))
    })

    taskUpdate.push(db.ref('room_names/'+conversation_id).update({
        isSave:true,
        uniquekey:uniqueKey
    }))
    await Promise.all(taskUpdate);
    return {success:true}
}

function getUniqueKey(u1,u2){
    if(u1>u2){
        return u1+u2;
    }else{
        return u2+u1;
    }
}