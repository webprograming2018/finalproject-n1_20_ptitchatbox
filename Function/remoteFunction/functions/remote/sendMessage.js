const mysql = require("../mysql");
const {db,admin} = require("../firebase");
const HASH = require('../md5');

/*sendMessage("GDUELIvH2xYOV4BH2nKjcKB4jOF3",{
    mssv:"B14DCCN160",
    message:{
        type:"text",
        message:"test"
    }
})*/

module.exports = sendMessage;

async function sendMessage(uid,data){
    const connect = mysql();
    const reception_id = data.mssv;
    let sender_id =await db.ref("users/"+uid+"/mssv").once("value");

    sender_id = sender_id.val();

    const sender_id_hash = HASH(sender_id);
    const reception_id_hash = HASH(reception_id);

    if(sender_id===reception_id){
        throw new Error("Bạn không thể gửi tin nhắn tới chính mình");
    }

    const sql = `SELECT * FROM \`ptitvl\`.\`dssv\` WHERE mssv="${reception_id}" OR mssv="${sender_id}"`;

    const user = await new Promise((resolve)=>{
        connect.query(sql,(error,result)=>{
            if(error){
                return resolve({
                    error:error.toString(),
                })
            }
            if(result.length===2){
                const obj = {};
                result.forEach(element => {
                    if(element.mssv===reception_id){
                        obj['reception'] = element;
                    }else{
                        obj['sender'] = element;
                    }
                });
                return resolve(obj);
            }else{
                resolve({
                    error:'Người dùng không tồn tại hoặc dữ liệu người dùng chưa được update'
                })
            }
        })
    })

    if(user.error){
        throw user.error;
    }

    const idCon = iDConversation(reception_id,sender_id);


    const snapCon =await db.ref("room_names/"+idCon).once("value");
    const conversation = snapCon.val();

    const task = [];

    //Cần update user vào firebase
    task.push(db.ref("public/"+sender_id_hash).update({
        class:user.sender.class,
        full_name:user.sender.full_name
    }))

    task.push(db.ref("public/"+reception_id_hash).update({
        class:user.reception.class,
        full_name:user.reception.full_name
    }))

    if(conversation){
        const message = {
            timestamp:admin.database.ServerValue.TIMESTAMP,
            author:sender_id_hash,
            data:{
                text:data.message
            },
            type:'text'
        };
        task.push(db.ref("messages/"+idCon).push(message));
    }else{
        const obj = {};
        task.push(db.ref("/room_names/"+idCon).set({
            timestamp:admin.database.ServerValue.TIMESTAMP,
            type:"friend",
            public:true
        }))


        obj[sender_id_hash] = {access:true};
        obj[reception_id_hash] = {access:true};

        let [publicSender,publicReception] = await Promise.all([
            db.ref("public/"+sender_id_hash).once('value'),
            db.ref("public/"+reception_id_hash).once('value')
        ]);

        if(publicSender.val()){
            const value = publicSender.val();
            if(value.share){
                obj[sender_id_hash] = value.share;
            }
        }
        if(publicReception.val()){
            const value = publicReception.val();
            if(value.share){
                obj[reception_id_hash] = value.share;
            }
        }

        task.push(db.ref("/members/"+idCon).set(obj));

        const message = {
            timestamp:admin.database.ServerValue.TIMESTAMP,
            author:sender_id_hash,
            data:{
                text:data.message
            },
            type:'text'
        };

        const _tmp = {};
        _tmp[idCon] = {
            timestamp:admin.database.ServerValue.TIMESTAMP
        };
        // push public info

        const _mem = {};
        _mem[sender_id_hash] = true;
        _mem[reception_id_hash] = true;

        task.push(db.ref("privatemember/"+idCon).update({
            type:'friend',
            members:_mem
        }))

        const roomMem = {};
        roomMem[sender_id_hash] = true;
        roomMem[reception_id_hash] = true;

        task.push(db.ref("/room_names/"+idCon+"/members").update(roomMem))
        task.push(db.ref("conversation/"+sender_id_hash+"/friends").update(_tmp));
        task.push(db.ref("conversation/"+reception_id_hash+"/friends").update(_tmp));
        task.push(db.ref("messages/"+idCon).push(message));
    }
    await Promise.all(task);
    return {conversation_id:idCon};
}

function iDConversation(mssv1,mssv2){
    if(mssv1>mssv2){
        return HASH(mssv1+mssv2);
    }else{
        return HASH(mssv2+mssv1);
    }
}