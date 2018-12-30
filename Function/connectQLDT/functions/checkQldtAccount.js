const functions = require("firebase-functions");
const crawler = require("./crawler");
const {db,admin} = require("./firebase");
const HASH = require('./md5');


/*function checkqldtaccount(){
    const task = [];
    db.ref("qldt").on("child_added",(snap)=>{
        const matkhau = snap.val();
        const taikhoan = snap.key;
        task.push({taikhoan,matkhau});
    })
    setTimeout(async ()=>{
        let tk = task.pop();
        const changepassSnap = await db.ref("changepass").once("value");
        const changepass = changepassSnap.val();
        let i = 0;
        while(tk){
            const check = await db.ref("checkqldtaccount/"+HASH(tk.taikhoan)+"/uid").once("value");
            if(check.val() || changepass && changepass[tk.taikhoan] === tk.matkhau){
                console.log("bo qua "+(++i));
                tk = task.pop();
                continue
            }
            try{
                const result = await connectQLDT(tk.taikhoan,tk.taikhoan,tk.matkhau);
                if(result.error && result.error==="Không thể đăng nhập!"){
                    console.log("Account change password: "+tk.taikhoan);
                    db.ref("changepass/"+tk.taikhoan).set(tk.matkhau);
                    tk = task.pop();
                    continue
                }else if(result.error){
                    db.ref("error/"+tk.taikhoan).update({
                        matkhau:tk.matkhau,
                        error:result.error
                    });
                }else if(result.success){
                    console.log("Update :"+tk.taikhoan);
                }else{
                    debugger
                }
            }catch(error){
                debugger
            }
            tk = task.pop();
        }
    },5000);
}*/

//checkqldtaccount();

//connectQLDT("B15DCVT001","B15DCVT001","01695133223");

//connectQLDT("B14DCCN762","B14DCCN762","Khatvong96");

async function connectQLDT(uid, username, password, session) {
    try {
      const data = session
        ? await crawler.loginQLDT(null, null, session)
        : await crawler.loginQLDT(username, password);
      
      if (data.user.type !== "sv") {
        return {
          success: false,
          error: "Invalid user",
          user: data.user
        };
      }
  
      //handle tk đã liên kết với với uid khác
  
      /*
      if(oldUserData&&oldUserId){
        await db.ref('users/'+oldUserId).remove();
        await db.ref('users/'+uid).update(oldUserData);
        return {
          success:true
        };
      }*/
      ///////////////////////////////////////////
  
      const [infoAndMark, dkmh,lichthi] = await Promise.all([
        crawler.infoAndMark(data.cookie),
        crawler.crawlerDKMH(data.user.mssv, data.cookie),
        crawler.crawlerLichThi(data.cookie)
  
      ]);
      if (infoAndMark.error) {
        // save body
        /*await db.ref("error/" + data.user.mssv).update({
          diemthi: infoAndMark
        });*/
      }
      if (dkmh.error) {
        //save body
        // await db.ref("error/" + data.user.mssv).update({
        //   dkmh
        // });
      }
  
  
  
  
      const r = await crawler.updateCSDL({
        diem: infoAndMark.diem,
        basicInfo: infoAndMark.baseinfo,
        dkmh,
        lichthi,
        uid
      });
      return r;
    } catch (ex) {
      return {
        success: false,
        error: ex.message
      };
    }
  }