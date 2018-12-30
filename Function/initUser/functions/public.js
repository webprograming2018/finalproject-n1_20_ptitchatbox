const mysql = require("./mysql");
const {db} = require("./firebase");

createPublicAccess();
function createPublicAccess(){
    const connect = mysql();
    const sql = "SELECT * FROM `ptitvl`.`dssv`";
    connect.query(sql,async (error,result)=>{
        if(error){
            debugger;
        }
        const task = [];
        for(let i=0;i<result.length;i++){
            const item = result[i];
            task.push(db.ref("public/"+item.mssv).update({
                full_name:item.full_name,
                class:item.class
            }))
        }
        await Promise.all(task);
    })
}