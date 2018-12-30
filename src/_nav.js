export default {
  items: [
    {
      name: "Mọi người",
      url: "/chatroom/chattong",
      icon: "fas fa-user-friends fa-lg"
    },
    {
      name: "Chat với người lạ",
      url: "/chatandanh",
      icon: "fas fa-search fa-lg"
    },
    {
      name: "Cuộc trò chuyện",
      url: "/conversation/friends/web",
      icon: "fas fa-lg fa-user-friends",
      children: [
        {
          name: "Gửi tin nhắn",
          url: "/sendmessage",
          icon: "fas fa-lg fa-paper-plane"
        },
        {
          name: "Bạn bè",
          url: "/conversation/friends/web",
          icon: "fas fa-lg fa-user-friends"
        },
        {
          name: "Nhóm lớp",
          url: "/conversation/groups/web",
          icon: "fas fa-lg fa-layer-group"
        }
      ]
    },
    {
      name: "Profile",
      url: "/profile/public",
      icon: "fas fa-user",
      children: [
        {
          name: "Public",
          url: "/profile/public",
          icon: "fas fa-user"
        },
        {
          name: "Private",
          url: "/profile/private",
          icon: "fas fa-user-shield"
        }
      ]
    },
    {
      title: true,
      name: "Học tập",
      class: "",
      wrapper: {
        element: "",
        attributes: {}
      }
    },
    {
      name: "Điểm thi",
      url: "/hoctap/diemthi",
      icon: "fas fa-file-signature"
    },
    {
      name: "Tài liệu",
      url: "/hoctap/tailieu",
      icon: "fas fa-book"
    },
    {
      name: "Cài đặt",
      url: "/setting",
      class: "mt-auto",
      icon: "fas fa-lg fa-sliders-h",
      variant: "success"
    }
  ]
};
