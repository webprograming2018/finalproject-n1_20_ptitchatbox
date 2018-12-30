
const { db } = require("../firebase");

//handleChangeTimestamp("0ff81cf82af76c589463a316b13d51e1",2)

async function handleChangeTimestamp(conversation_id,timestamp){
    const memberSnap = await db.ref("privatemember/"+conversation_id).once("value");
    const data = memberSnap.val();
    const {members,type} = data;
    const task = [];
    for(let idMem in members){
        if(type === 'group'){
            const data =await db.ref("conversation/"+idMem+"/groups/"+conversation_id).once("value");
            if(!data.val()){
                continue;
            }
            task.push(db.ref("conversation/"+idMem+"/groups/"+conversation_id).update({
                timestamp:timestamp
            }))
        }else if(type === 'friend'){
            const data =await db.ref("conversation/"+idMem+"/friends/"+conversation_id).once("value");
            if(!data.val()){
                continue;
            }
            task.push(db.ref("conversation/"+idMem+"/friends/"+conversation_id).update({
                timestamp:timestamp
            }))
        }
    }
    return await Promise.all(task);
}




module.exports = handleChangeTimestamp;