#BÁO CÁO BÀI TẬP LỚN MÔN LẬP TRÌNH WEB
##HỌC KỲ I NĂM HỌC 2018 - 2019
###Nhóm: 20
###Thành viên:
* 1. Họ và tên: Nguyễn Văn Thường.Mã sinh viên:B14DCCN762
* 2. Họ và tên: Lê Văn Thông.Mã sinh viên: B15DCCN540
* 3. Họ và tên: Lăng Hồng Sơn.Mã sinh viên: B14DCPT465

###Nội dung
1.Giới thiệu sơ lược về chủ đề
* a.Mục tiêu: Chatbox được tạo ra dùng để kết nối sinh viên PTIT. Các sinh viên có thể giao lưu với những người khác cùng lớp cùng khoa. Chatbox muốn sử dụng thuật toán ghép cặp dựa vào thông tin thực của sinh viên như tên, tuổi , lớp , khoa, giới tính, quê quán để tạo ra những cuộc trò chuyện chất lượng cho sinh viên. Ví dụ nó ưu tiên tạo ra các cuộc trò chuyện cho sinh viên cùng quê, cùng lớp, cùng khoa. Ngoài ra chatbox còn phát triển các cung cụ liên đến học tập như upload tài liệu, xem điểm, thông báo lịch học, lịch thi, đăng kí thử tín chỉ.
* b. Tạo ra được 1 chatbox cho sinh viên đăng nhập bằng tk quản lý đào tạo của mình. chatbox có các chức năng là ghép cặp cho 2 người trong chatbox nói chuyện với nhau, chia sẻ thông tin của nhau cho nhau xem . mọi người có phần profile để thay đổi avatar và cover. cho phép xem điểm thi, xem biểu điểm của cả môn học, cho phép upload tài liệu môn học, cho phép đặt thông báo tkb và lịch thi, cho phép giả lập đăng kí thử tín chỉ. Và một con chatbot messenger tạo ra để hỗ trợ hoạt động của chatbox.
* c.  Đa số mọi người đều không biết cách sử dụng các chức năng của chatbox hiểu được mục tiêu của chatbox, nhiều người ko muốn mở rộng kết nối của họ.
Số lượng người dùng chưa đủ lớn để thuật toán ghép cặp tạo ra được những cuộc trò chuyện chất lượng. 
Chatbox chỉ có thể hoạt động hiệu quả khi có đông người dùng.
Do việc crawler vào quản lý đào tạo nên chức năng login hoạt động không hiệu quả.
Định hướng là làm sao để mọi người hiểu được mục tiêu của chatbox và biết cách sử dụng hết chức năng của nó hiệu quả.

xây dựng hàm login bằng cách sử dụng qldt, xây dựng chatroom frontend, xây dựng conversion frontend, xây dựng xemdiem frontend, xây dựng  caidat frontend, xây dựng trang đăng kí thử.

2.Phân công công việc

| STT       | Họ và tên          | Các nội dung thực hiện  |    Đánh giá    |
| ------------- |:-------------:| -----| ----------|
| 1      | Nguyễn Văn Thường  |  HTML, CSS cho các trang trong project , xây dựng phần login| Tốt |
| 2      | Lê Văn Thông |   HTML, CSS cho các trang trong project , xây dựng phần login | Tốt | 
| 3     | Lăng hồng sơn     |    Xây dựng database, logic trong app, API, trang đăng kí thử tín chỉ | Tốt |


3.Quá trình thực hiện

| Phiên bản       | Chức năng          | Các nội dung thực hiên  | Thời gian  |  Vấn đề gặp phải  |  Link tải  |
| :------------- |:-------------:| :-----:|  :------------- |:-------------:| :-----:| 
| 1.0      | authenticate bằng tk qldt, gửi tin nhắn cho sinh viên bằng mssv,tạo ra các group chat cho lớp | HTML,css: Copy từ facebook, javascript: sử dụng native js, server: sử dụng nodejs + socket.io   | 2 tuần |  - prob:Việc copy mã nguôn facebook làm cho 1 trang vốn rất nhẹ trở nên rất là nặng. Xử lý bất đồng bộ trong javascript theo kiểu promise then làm cho code rất rối, các vấn đề về authenticate trong expressJS, Socket.io, xây dựng các room để listen sự kiện, phần crawler bằng qldt có rất nhiều ngoại. - Solution: Sử dụng firebase thay thấy expressJS và Socket.io, Tự layout lại web, phải release để test dần trên người dùng thật | https://github.com/nvthuong1996/baocao1-expressjs|
| 2.0 | Vẫn giống version 1| đọc tài liệu firebase , cloud function, layout lại các trang |   5 tuần | Prop: Phần frontend vẫn chưa đủ tốt, khi web phải responsive cho cả thiết bị di động và desktop, nhất là phần menu là phần rắc rối nhất, menu phải tự thụt ra thụt vào khi click item và phải highlight được các item cho biết user đang ở trong item nào, phần chatroom chưa hiển thị được các loại message như emoij và hình ảnh , file. - Sulution: Nếu làm tiếp thì rối code và ko tối ưu cho responsive. - Sulotion: Dùng thư viện có sẵn layout phần menu , và phần chatroom |https://github.com/webprograming2018/finalproject-n1_20_ptitchatbox |
| 3.0 | Vẫn giống version 3 bổ xung xem điểm và upload tài liệu     | Crawler điểm của sinh viên toàn trương, làm lại version 2  | 3 tuần | Prop: Làm sao để crawler được tất cả điểm thi sinh viên ptit về để làm dữ liệu thống kê. Trang dt.ptit.vl cho phép xem điểm theo mssv nhưng nó limmit trong 10 phút được request 30 lần, làm sao biết được danh sách sinh viên toàn trường để làm dữ liệu input cho crawler điểm.  Sau khi hoàn thiện app không hoạt động được trên một số trình duyệt mobile do lỗi javascript mà lại không đọc được log. Nhiều sv không thích login bằng tài khoản qldt vì phải sử dụng pass. -Sulotion: Dùng dải ip động của heroku và remote app heroku từ xa để crawler, crawler danh sách sinh viên dựa vào các api ẩn của qldt. Phải làm lại app và theo dõi sự hoạt động của nó trên chế độ webview trong messenger. Sử dụng phương pháp authenticate bằng số điện thoại và thêm 1 bước kết nối với qldt. Như vậy người dùng chỉ phải dùng pass qldt 1 lần ở bước kết nối | https://github.com/webprograming2018/finalproject-n1_20_ptitchatbox |
| 3.0 | Vẫn giống version 3, bổ xung profile và các page để hoạt động trong messenger     | Chủ yếu là tối ưu lại app, làm profile và các trang trong messenger  | 1 tuần | Prop: Sử dụng login bằng số điện thoại làm nhiều sv hiểu rằng app muốn ăn chộm sđt của họ, Không có nhiều người sử dụng. Sulotion: Thay đổi cách authentica từ số điện thoại sang sử dụng đăng nhập Facebook API, và sử dụng idforapp trong messenger. Phần đăng nhập sẽ được tối ưu đến mức người dùng sẽ đăng nhập vào hệ thống mà không biết là mình đăng nhập lúc nào |https://github.com/webprograming2018/finalproject-n1_20_ptitchatbox  |
| 4.0 | Vẫn giống version 3    | Sửa lại login bằng sđt sang login qua facebook. login qua messenger và hướng người dùng login từ trang đăng kí thử tín chỉ | 1 tuần | Prop: Có quá nhiều id liên kết với tài khoản. Firebase nó sinh ra một uid người dùng, facebook tạo ra 1 id, messenger tạo ra 1 id. Hơn nữa do tính chất của app mỗi người dùng có 2 cái id riêng để bảo mật thông tin của họ khi hoạt động trên chatbox. một id để trò chuyện với bạn bè để bbe truy cập đến các public info. Một id dùng để chat ẩn danh chứa các private info.  Trước kia user sử dụng id do firebase cấp làm id thứ 2 luôn. Vì vây muốn disconect một tài khoản qldt với tk firebase thì đó là điều ko thể. Phải xác định người dùng ở context nào và cho login ngay khi có thể. Solution: Tối ưu lại cơ sở dữ liệu thay đổi hầu hết các hàm logic của backend | https://github.com/webprograming2018/finalproject-n1_20_ptitchatbox |


Thầy giáo có thể truy cập vào chatbox tại: https://chatbox.ptit.info với tài khoản liên kết là admin pass: admin@