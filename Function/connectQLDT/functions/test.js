const request = require("request");
const token = "EAAfr5Q9M4ZBsBAPOa3w2r0OUAD3WnRuwN28a7cZAmB35nLG6yq5KT1H0xZCZAiFShkq8wHNSoyXD0c0iWgbzWC76gOVctB0YvOuEoEuV1RbFAqxJtyazUdFjaLqsK9V5OLD3QKhgFrc723yQRIqJH1ZClNBrmdRQZCvdHahxNnrKfXganBJZATN";
const url = `https://graph.facebook.com/v3.2/me?access_token=${token}`;
new Promise((resolve,reject)=>{
  request.get(url,(error,res,body)=>{
    if(error){
      return reject(error);
    }
    const data = JSON.parse(body);
    if(data&&data.id){
      return resolve(data.id);
    }else{
      return reject(new Error("Lỗi không xác định"));
    }
  })
})