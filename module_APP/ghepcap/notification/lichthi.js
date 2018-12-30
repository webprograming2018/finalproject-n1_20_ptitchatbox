const { admin } = require("../firebase");

module.exports = setupNotification;

function setupNotification(data) {
  data.time = data.time.split("-");
  data.time[1] = parseInt(data.time[1]) - 1;
  const time = new Date(...data.time);
  const phong = data.phong;
  const tenmh = data.tenMh;

  // lan 1 vao 6h sang hom thi
  // lan 2 vao 6h sang ngay hom truoc
  // lan 3 vao 6h sang ngay hom truoc truoc
  // lan 4 vao 2h truoc thi
  // lan 5 vao 1h truoc thi
  // lan 6 vao 30phut truoc thi
  const time1 = new Date(time.getTime());
  time1.setHours(6);
  let titel1 = "Sắp thi: " + tenmh;
  let body1 = `Hôm nay bạn có 1 bài thi vào lúc ${time.getHours()} giờ ${time.getMinutes()<10?'0'+time.getMinutes().toString():time.getMinutes().toString()}  ngày ${time.getDate()}/${time.getMonth() +
    1}/${time.getFullYear()}. Tại phòng học ${phong} `;
  sendNotifi(
    {
      title: titel1,
      body: body1,
      topic: data.topic,
      ttl:3600
    },
    time1
  );

  const time2 = new Date(time.getTime());
  time2.setHours(6);
  time2.setDate(time.getDate() - 1);
  let titel2 = "Sắp thi: " + tenmh;
  let body2 = `Ngày mai bạn có một bài thi vào lúc ${time.getHours()} giờ ${time.getMinutes()<10?'0'+time.getMinutes().toString():time.getMinutes().toString()}  ngày ${time.getDate()}/${time.getMonth() +
    1}/${time.getFullYear()}. Tại phòng học ${phong} `;
  sendNotifi(
    {
      title: titel2,
      body: body2,
      topic: data.topic,
      ttl:43200
    },
    time2
  );

  const time3 = new Date(time.getTime());
  time3.setHours(6);
  time3.setDate(time.getDate() - 2);
  let titel3 = "Sắp thi: " + tenmh;
  let body3 = `Ngày kia bạn có một bài thi vào lúc ${time.getHours()} giờ ${time.getMinutes()<10?'0'+time.getMinutes().toString():time.getMinutes().toString()} phút. ngày ${time.getDate()}/${time.getMonth() +
    1}/${time.getFullYear()}. Tại phòng học ${phong} `;
  sendNotifi(
    {
      title: titel3,
      body: body3,
      topic: data.topic,
      ttl:86400
    },
    time3
  );

  const time4 = new Date(time.getTime());
  time4.setHours(time4.getHours() - 2);
  let titel4 = "Sắp thi: " + tenmh;
  let body4 = `Bạn còn 2 giờ để chuẩn bị cho bài thi. Thời gian là vào lúc ${time.getHours()} giờ ${time.getMinutes()<10?'0'+time.getMinutes().toString():time.getMinutes().toString()} phút. Tại phòng học ${phong}`;
  sendNotifi(
    {
      title: titel4,
      body: body4,
      topic: data.topic,
      ttl:1200
    },
    time4
  );

  const time5 = new Date(time.getTime());
  time5.setHours(time5.getHours() - 1);
  let titel5 = "Sắp thi: " + tenmh;
  let body5 = `Đến trường nào! Sắp thi rồi. Bạn có 1 bài thi vào lúc ${time.getHours()} giờ ${time.getMinutes()<10?'0'+time.getMinutes().toString():time.getMinutes().toString()}  phút. Tại phòng học ${phong}`;
  sendNotifi(
    {
      title: titel5,
      body: body5,
      topic: data.topic,
      ttl:1200
    },
    time5
  );

  const time6 = new Date(time.getTime());
  time6.setMinutes(-30);
  let titel6 = "Sắp thi: " + tenmh;
  let body6 = `Còn 30 phút nữa là bắt đầu làm bài thi tại phòng học ${phong}`;
  sendNotifi(
    {
      title: titel6,
      body: body6,
      topic: data.topic,
      ttl:1200
    },
    time6
  );
}

function sendNotifi(data, time2) {
  const delay = time2.getTime() - new Date().getTime();

  console.log(data.title+'.Time: '+time2.getDate()+'/'+(time2.getMonth()+1)+'. Vao luc: '+time2.getHours()+':' + time2.getMinutes());
  if (delay > 0 && delay / 1000 / 60 / 60 / 24 < 11) {
    setTimeout(async () => {
      const message = {
        webpush: {
          notification: {
            title: data.title,
            body: data.body,
            requireInteraction: true,
            icon: "/badge-icon.png"
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
    }, delay);
  }
}
