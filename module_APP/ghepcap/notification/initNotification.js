const {firebase} = require('../firebase');
const notificationTKB = require('./tkb.js');
const notificationLichThi = require('./lichthi.js');

module.exports = init;

async function init(){
    firebase.ref('topicnotification').on('child_added',(data)=>{
        const dataNotifi = data.val();
        dataNotifi['topic'] = data.key;
        //console.log(JSON.stringify(dataNotifi));
        if(dataNotifi.type==='lichthi'){
            return notificationLichThi(dataNotifi);
        }else if(dataNotifi.type==='tkb'){
            return notificationTKB(dataNotifi);
        }
    })
}