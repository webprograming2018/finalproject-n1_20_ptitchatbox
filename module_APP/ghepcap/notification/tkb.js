const { admin } = require("../firebase");

module.exports = setupNotificationTKB;

const yearstart = 2018,
  mothstart = 8,
  daystart = 13;

const DATESTART = new Date(yearstart, mothstart - 1, daystart, 0, 0, 0);

/*const testData = {"tenmh":"Cơ sở dữ liệu phân tán","time":[{"phong":"302-A2","time":9},{"phong":"302-A2","time":177},{"phong":"302-A2","time":345},{"phong":"302-A2","time":681},{"phong":"302-A2","time":849},{"phong":"302-A2","time":1017},{"phong":"302-A2","time":1185},{"phong":"302-A2","time":1353},{"phong":"302-A2","time":1521},{"phong":"302-A2","time":1689},{"phong":"302-A2","time":1857},{"phong":"302-A2","time":2025},{"phong":"302-A2","time":2193},{"phong":"302-A2","time":2361},{"phong":"302-A2","time":2529}],"type":"tkb","topic":"D15-140"}
setupNotificationTKB(testData);*/

function setupNotificationTKB(data) {
  data.time.forEach(element => {
    const khoangcach = element.time;
    const phong = element.phong;
    const time = new Date(DATESTART.getTime());
    time.setHours(time.getHours() + khoangcach);

    return setNotifi({
      time,
      phong,
      tenmh: data.tenmh,
      topic: data.topic
    });
  });
}

function setNotifi(data) {
  const time = data.time;

  const time1 = new Date(time.getTime());
  const time2 = new Date(time.getTime());

  time1.setMinutes(-30);
  time2.setHours(time2.getHours() - 1);

  const title1 = data.tenmh;
  const body1 = "30 phút nữa kíp học sẽ bắt đầu tại phòng " + data.phong;

  const now = new Date().getTime();

  const r1 = time1.getTime() - now;
  if (r1 > 0 && r1 / 1000 / 60 / 60 / 24 < 25) {
    console.log(
      "Time: " +
        time1.getDate() +
        "/" +
        (time1.getMonth() + 1) +
        ". Vao luc: " +
        time1.getHours() +
        ":" +
        time1.getMinutes()
    );
    setTimeout(() => {
      sendNotifi({
        title: title1,
        body: body1,
        topic: data.topic,
        ttl:1200
      });
    }, 0);
  }

  const title2 = data.tenmh;
  const body2 = "1 giờ nữa kíp học sẽ bắt đầu tại phòng " + data.phong;

  const r2 = time2.getTime() - now;
  if (r2 > 0 && r2 / 1000 / 60 / 60 / 24 < 2) {
    console.log(
      "Time: " +
        time2.getDate() +
        "/" +
        (time2.getMonth() + 1) +
        ". Vao luc: " +
        time2.getHours() +
        ":" +
        time2.getMinutes()
    );
    setTimeout(() => {
      sendNotifi({
        title: title2,
        body: body2,
        topic: data.topic,
        ttl:1200
      });
    }, r2);
  }
}

async function sendNotifi(data) {
  const message = {
    webpush: {
      notification: {
        title: data.title,
        body: data.body,
        requireInteraction: true,
        icon: "/badge-icon.png"
      },
      headers:{
        TTL:data.ttl
      }
    },
    topic: data.topic
  };
  try {
    const r = await admin.messaging().send(message);
    return r;
  } catch (error) {
    debugger;
  }
}

/*sendMessage();
async function sendMessage() {
  const message = {
    webpush: {
      notification: {
        title: "Test",
        body:
          "Test thu thong bao",
      }
    },
    topic: "D15-114"
  };
  try{
    const r = await admin.messaging().send(message);
    return r;
  }catch(error){
      debugger
  }

}*/
