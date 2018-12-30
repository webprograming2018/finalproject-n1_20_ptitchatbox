const {db,admin} = require("../firebase");

//removeMark("GDUELIvH2xYOV4BH2nKjcKB4jOF3","BAS1106","private")

module.exports = {
    addBasicInfo,
    addMark,
    removeBasicInfo,
    removeMark
}

async function addBasicInfo(uid,iduser,att,type){
    const Snap = await Promise.all([
        db.ref("users/"+iduser+"/"+att).once('value')
    ]);
    
    const value = Snap[0].val();

    if(!iduser||!value){
        throw new Error("Error remote function: addBasicInfo");
    }

    const obj = {};
    obj[att] = value;
    if(type==='private'){
        await db.ref("public/"+uid+"/share/basicinfo").update(obj);
    }else if(type==='public'){
        await db.ref("public/"+iduser+"/share/basicinfo").update(obj);
    }else{
        throw new Error("Type profile invalid !");
    }

    return {sucess:true}
}

async function addMark(uid,iduser,msmh,type){
    const Snap = await Promise.all([
        db.ref("users/"+iduser+"/bangdiem").once('value')
    ]);
    
    const bangdiem = Snap[0].val();

    if(!iduser||!bangdiem){
        throw new Error("Error remote function: addMark");
    }

    let diem = null;
    for(let i in bangdiem){
        const namhoc = bangdiem[i];
        for(let j of namhoc){
            if(msmh===j[1]){
                diem = j;
                break;
            }
        }
    }
    if(!diem){
        throw new Error("Mark not found");
    }


    const obj = {};
    obj[msmh] = diem;

    if(type==='private'){
        await db.ref("public/"+uid+"/share/bangdiem").update(obj);
    }else if(type==='public'){
        await db.ref("public/"+iduser+"/share/bangdiem").update(obj);
    }else{
        throw new Error("Type profile invalid !");
    }

    return {sucess:true}
}

async function removeBasicInfo(uid,iduser,att,type){

    if(!iduser){
        throw new Error("Error remote function: addBasicInfo");
    }

    if(type==='private'){
        await db.ref("public/"+uid+"/share/basicinfo/"+att).remove();
    }else if(type==='public'){
        await db.ref("public/"+iduser+"/share/basicinfo/"+att).remove();
    }else{
        throw new Error("Type profile invalid !");
    }

    return {sucess:true}
}

async function removeMark(uid,iduser,msmh,type){
    if(!iduser){
        throw new Error("Error remote function: addMark");
    }

    if(type==='private'){
        await db.ref("public/"+uid+"/share/bangdiem/"+msmh).remove();
    }else if(type==='public'){
        await db.ref("public/"+iduser+"/share/bangdiem/"+msmh).remove();
    }else{
        throw new Error("Type profile invalid !");
    }

    return {sucess:true}
}