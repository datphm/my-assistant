# My Assistant

Một web app riêng cho bạn, mở được trên máy tính và iPhone; dữ liệu nằm trong Google Sheets riêng của tài khoản Google Workspace. App gửi email nhắc việc, lưu hồ sơ cá nhân, ví/tài khoản, CV, nợ, thực đơn, chuyến bay và có thể nhập chi tiêu từ **các email ngân hàng mà bạn chủ động chọn**.

## Hồ sơ, CV và dòng tiền

- Tab **Hồ sơ** lưu ngày sinh, nhóm máu, liên hệ khẩn cấp và ghi chú sức khỏe. Đây là dữ liệu riêng tư, nên Web App phải luôn để quyền truy cập là **Only myself**.
- Tab **CV** lưu nhiều phiên bản CV, vai trò hướng tới, ghi chú chỉnh sửa và link Google Docs/Drive. Bấm **Cập nhật** để thay đổi một CV đã lưu.
- Tab **Tiền** cho phép thêm ví, tài khoản ngân hàng hoặc thẻ; nhập chi tiêu thủ công; và hiển thị biểu đồ phân bổ chi tiêu tháng hiện tại. Email ngân hàng được gán nhóm chi tiêu tự động theo từ khóa phổ biến; bạn nên kiểm tra lại những giao dịch gán vào nhóm `Khác`.
- Bạn có thể đặt tỷ trọng riêng qua nút **Thiết lập %**. Các tỷ trọng này là mục tiêu do bạn đặt, không phải khuyến nghị tài chính của app.

## Cách dùng đơn giản nhất

GitHub **không** cài app vào iPhone. GitHub dùng để lưu mã nguồn. Cách đơn giản và miễn phí là triển khai app này thành Google Apps Script Web App, rồi mở cùng một link trên Mac và iPhone.

1. Vào [script.google.com](https://script.google.com), đăng nhập Google Workspace của bạn, chọn **New project**.
2. Tạo các file `Code.gs`, `Index.html`, `Styles.html`, `Script.html`, và `appsscript.json`; dán đúng nội dung từ thư mục này vào từng file. Trong Project Settings, đổi timezone thành `Asia/Ho_Chi_Minh`.
3. Chọn **Deploy → New deployment → Web app**. Execute as: **Me**; Who has access: **Only myself**. Bấm Deploy, chấp nhận các quyền Google mà app giải thích.
4. Mở URL Web App trên Mac để dùng desktop. Trên iPhone, mở URL bằng Safari → **Share → Add to Home Screen**. Đây sẽ là biểu tượng “My Assistant” trên màn hình chính.
5. Trong app, bấm **Bật email nhắc** một lần. App sẽ kiểm tra mỗi 2 tiếng và email bạn cho tới khi bạn bấm dấu ✓ hoàn thành việc. Có thể đổi tần suất ở hàm `installReminderTrigger`.

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

## Bản native iPhone

Thư mục `../NhipSong` là bản SwiftUI native trước đó. Để phát hành nó lên iPhone cần Mac có Xcode và Apple Developer account/TestFlight; GitHub không thể thay thế bước ký ứng dụng đó. Bản Web App này là cách dùng được ngay trên cả hai thiết bị.
