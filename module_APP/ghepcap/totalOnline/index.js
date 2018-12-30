const { firebase } = require("../firebase");

const ref = firebase.ref("/status");

const user = {};

/*setTimeout(()=>{
    x.a=1;
},10000)*/

function calOnline(){
    let i = 0;
    for(let j in user){
        if(user[j]=="online"){
            i++;
        }
    }
    return i;
}

function saveUserOnline(){
    firebase.ref("/totalOnline").update({
        online:calOnline()
    });
}


ref.on("child_changed", function(snapshot) {
    var newPost = snapshot.val();
    user[snapshot.key] = newPost.state;
    saveUserOnline();
});

ref.on("child_added", function(snapshot, prevChildKey) {
    var newPost = snapshot.val();
    user[prevChildKey] = newPost.state;
});