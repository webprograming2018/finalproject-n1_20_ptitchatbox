const {db} = require("./firebase");

reset();

async function reset(){
    const task = [];

    task[0] = db.ref("/").remove();
    //task[1] = db.ref("members").remove();
    //task[2] = db.ref("messages").remove()
    //task[3] = db.ref("public").remove()
    //task[4] = db.ref("room_names").remove();
    
    await Promise.all(task);
}
