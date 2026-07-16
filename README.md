# My Assistant

Một web app riêng cho bạn, mở được trên máy tính và iPhone; dữ liệu nằm trong Google Sheets riêng của tài khoản Google Workspace. App gửi email nhắc việc, lưu hồ sơ cá nhân, ví/tài khoản, CV, nợ, thực đơn, chuyến bay và có thể nhập chi tiêu từ **các email ngân hàng mà bạn chủ động chọn**.

## Hồ sơ, CV và dòng tiền

- Tab **Hồ sơ** lưu ngày sinh, nhóm máu, liên hệ khẩn cấp và ghi chú sức khỏe. Đây là dữ liệu riêng tư, nên Web App phải luôn để quyền truy cập là **Only myself**.
- Tab **CV** lưu nhiều phiên bản CV, vai trò hướng tới, ghi chú chỉnh sửa và link Google Docs/Drive. Bấm **Cập nhật** để thay đổi một CV đã lưu.
- Tab **Tiền** cho phép thêm ví, tài khoản ngân hàng hoặc thẻ; nhập chi tiêu thủ công; và hiển thị biểu đồ phân bổ chi tiêu tháng hiện tại. Email ngân hàng được gán nhóm chi tiêu tự động theo từ khóa phổ biến; bạn nên kiểm tra lại những giao dịch gán vào nhóm `Khác`.
- Bạn có thể đặt tỷ trọng riêng qua nút **Thiết lập %**. Các tỷ trọng này là mục tiêu do bạn đặt, không phải khuyến nghị tài chính của app.

## Sức khỏe, ăn uống và vận động

- Tab **Sức khỏe** thay cho tab Ăn uống cũ nhưng vẫn giữ toàn bộ thực đơn đã lưu. Hồ sơ mặc định dùng chiều cao 165 cm, cân nặng bắt đầu 90 kg, mốc 75 kg rồi 70 kg và ngày mục tiêu 31/10/2026; tất cả đều sửa được.
- App tính tiến độ, BMI ước tính, tốc độ giảm cần thiết và vùng cân nặng tham khảo nếu giảm dần khoảng 0,5–1 kg mỗi tuần. Mục tiêu quá gấp sẽ được cảnh báo thay vì ép tăng cường độ.
- Bài tập ưu tiên đi bộ, vận động với ghế/tường, giãn cơ và cardio ít tác động. Mức bài tự tăng theo số phút đi bộ/thể dục đã log trong bảy ngày gần nhất.
- Nút **Nhắc mỗi ngày** tạo lịch vận động 10 phút trên Google Calendar; hệ thống nhắc thông minh cũng email nếu đến giờ mà chưa có phiên đi bộ/thể dục trong ngày.
- Đây là công cụ hỗ trợ thói quen, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng. Nếu có bệnh nền, đau khớp, đau ngực, chóng mặt hoặc khó thở bất thường, hãy dừng tập và tìm tư vấn y tế phù hợp.

## Cách dùng đơn giản nhất

GitHub **không** cài app vào iPhone. GitHub dùng để lưu mã nguồn. Cách đơn giản và miễn phí là triển khai app này thành Google Apps Script Web App, rồi mở cùng một link trên Mac và iPhone.

1. Vào [script.google.com](https://script.google.com), đăng nhập Google Workspace của bạn, chọn **New project**.
2. Tạo các file `Code.gs`, `Index.html`, `Styles.html`, `Script.html`, và `appsscript.json`; dán đúng nội dung từ thư mục này vào từng file. Trong Project Settings, đổi timezone thành `Asia/Ho_Chi_Minh`.
3. Chọn **Deploy → New deployment → Web app**. Execute as: **Me**; Who has access: **Only myself**. Bấm Deploy, chấp nhận các quyền Google mà app giải thích.
4. Mở URL Web App trên Mac để dùng desktop. Trên iPhone, mở URL bằng Safari → **Share → Add to Home Screen**. Đây sẽ là biểu tượng “My Assistant” trên màn hình chính.
5. Trong app, bấm **Bật hệ thống nhắc** một lần và cấp quyền Calendar/email. Bộ máy chạy mỗi 15 phút để bắt đúng cửa sổ thời gian, nhưng việc thường chỉ gửi lại mỗi 2 giờ; chỉ việc đặt chế độ **Bám đuổi** mới nhắc mỗi 15 phút. Bấm **Đã bắt đầu** hoặc dấu ✓ để dừng chuỗi nhắc.

## Nhắc chủ động và lịch bay

- Việc sắp đến hạn 30 phút, việc quá hạn và việc có nguy cơ bị quên được đưa vào trung tâm thông báo trong app; việc quan trọng tiếp tục được nhắc qua email theo nhịp đã chọn.
- Nút **Bật hệ thống nhắc** tạo bốn điểm neo sinh hoạt trong Google Calendar: ăn sáng, ăn trưa, ăn tối và chuẩn bị ngủ. App cũng nhắc log thời gian khi bạn đang thức nhưng chưa có phiên hoạt động nào.
- Tab **Chuyến đi → Rà lại lịch bay** đọc lại các email nằm trong truy vấn Gmail bạn đã thiết lập, cập nhật chuyến tương ứng và đồng bộ chuyến tương lai sang Calendar.
- Với mỗi chuyến tương lai, app tự phân loại nội địa/quốc tế, tính giờ nên rời đi từ thời gian di chuyển tới sân bay, thêm link check-in của các hãng phổ biến và nhắc mở check-in trước 24 giờ.
- Đây là bộ luật chạy miễn phí, không gọi AI và không phải dữ liệu vận hành trực tiếp từ hãng bay. Thay đổi hoặc delay chỉ được phát hiện khi email hãng/đại lý gửi về Gmail; trước khi đi vẫn cần kiểm tra lại trên website hoặc ứng dụng chính thức của hãng.

## Gmail và chi tiêu

App không thể đọc notification của iPhone hoặc inbox Zalo. Với Gmail, ở tab **Tiền**, chỉ nhập truy vấn Gmail hẹp cho email ngân hàng, ví dụ:

`from:alerts@ten-ngan-hang.com newer_than:30d`

Chọn ví/tài khoản tương ứng nếu muốn app cập nhật số dư. App chỉ cập nhật số dư khi email có cụm như `Số dư`, `Available balance` hoặc `Account balance`; nếu ngân hàng dùng mẫu khác, số dư sẽ không tự đổi nhưng giao dịch vẫn có thể được nhập.

Nút **Nhập ngay** quét thủ công. Nút **Bật tự động** lưu truy vấn đó và quét mỗi 2 tiếng. Hãy thử với ít email trước và kiểm tra kết quả; mỗi ngân hàng có mẫu nội dung khác nhau nên đây là tiện ích nhập liệu, không phải sổ kế toán chính xác. Không dùng truy vấn rộng như `newer_than:30d` vì nó sẽ có nguy cơ lấy nhầm email.

## Bảo mật

- Web App được đặt **Only myself**; không chia sẻ URL này.
- Dữ liệu tạo trong một Google Sheet riêng của chính tài khoản triển khai.
- Gmail chỉ được đọc khi bạn dùng nút nhập chi tiêu và cấp quyền lần đầu. Zalo cá nhân không được đọc.
- App không đưa ra lời khuyên đầu tư hay tín dụng; phần nợ là nơi theo dõi.

## Lưu vào GitHub (tùy chọn)

Tạo private repository trên GitHub, rồi upload toàn bộ các file trong thư mục này. Nếu muốn đồng bộ từ máy bằng dòng lệnh, cài [`clasp`](https://github.com/google/clasp) rồi dùng `clasp clone`/`clasp push`. Tuy nhiên lần đầu, copy-paste trong Apps Script thường nhanh và ít lỗi hơn.

### Tự deploy sau mỗi lần Codex sửa

Thư mục `.github/workflows/` đã có GitHub Actions. Sau lần thiết lập đầu, mỗi lần thay đổi được đẩy vào nhánh `main`, GitHub sẽ tự đẩy code sang đúng Apps Script Web App; URL `/exec` trên iPhone vẫn giữ nguyên.

Thiết lập một lần (mình có thể làm cùng bạn):

1. Tạo repository **private** và đưa toàn bộ thư mục này lên GitHub.
2. Trong Apps Script, mở **Project Settings** và copy **Script ID**.
3. Trong **Deploy → Manage deployments**, copy **Deployment ID** của Web App đang dùng.
4. Trên máy có Node.js, đăng nhập Apps Script một lần: `npx @google/clasp login`. Sau đó copy nội dung file `~/.clasprc.json`.
5. Trên GitHub repository: **Settings → Secrets and variables → Actions**, tạo ba secrets: `APPS_SCRIPT_ID`, `APPS_SCRIPT_DEPLOYMENT_ID`, `CLASPRC_JSON`.

Không đưa ba giá trị này vào source code, chat công khai hay repository. `CLASPRC_JSON` có quyền truy cập Apps Script của bạn.

Nếu GitHub báo `Unexpected end of JSON input` ở bước `clasp push`, gần như chắc chắn secret `CLASPRC_JSON` đang rỗng hoặc không phải JSON đầy đủ. Xóa secret đó rồi tạo lại:

1. Trên Mac mở Terminal, chạy `npx @google/clasp login`.
2. Sau khi đăng nhập xong, chạy `open ~/.clasprc.json`.
3. Copy toàn bộ nội dung file, bắt đầu bằng `{` và kết thúc bằng `}`.
4. Vào GitHub repository → **Settings → Secrets and variables → Actions** → `CLASPRC_JSON` → **Update**.
5. Dán đúng nội dung JSON vừa copy, không thêm dấu nháy ngoài, không dán vào chat.

## Bản native iPhone

## Bản offline trên điện thoại và máy tính

Thư mục `docs/` là bản offline/PWA đầy đủ các tab. Bạn có thể mở trực tiếp `docs/index.html` bằng Safari/Chrome trên máy tính hoặc iPhone; dữ liệu bản này lưu trong `localStorage` của từng thiết bị. Trên máy tính, nên dùng Chrome/Edge và chọn **Install app / Add to desktop** khi mở từ GitHub Pages. Bản offline không đọc Gmail và không gửi email; các tính năng đó vẫn dùng Web App Apps Script.

Để đưa dữ liệu cũ sang bản offline: Apps Script → **Cài app → Xuất file JSON**, sau đó trên bản offline chọn **Nhập dữ liệu JSON**. Không commit file JSON lên GitHub vì có thể chứa thông tin tài chính, hồ sơ và CV.

## Bản native iPhone

Thư mục `../NhipSong` là bản SwiftUI native trước đó. Để phát hành nó lên iPhone cần Mac có Xcode và Apple Developer account/TestFlight; GitHub không thể thay thế bước ký ứng dụng đó. Bản Web App này là cách dùng được ngay trên cả hai thiết bị.
