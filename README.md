# Sắc Xanh Xứ Nghệ

Website dạng sách/menu gồm 5 ảnh nguyên trang từ [thiết kế Canva](https://www.canva.com/design/DAHZ-cb46Rw/cSeUMLy4NEadVp3hpzzDtA/edit): Giới thiệu, Làng Sen quê Bác, Cửa Lò bến nhớ, Dấu ấn Sông Lam và Ví Dặm tình ca.

## Thiết kế

Ảnh được lấy trực tiếp từ bản render của Canva ở độ phân giải cao, lưu thành WebP 1440 × 1800 px trong `assets/pages`. Website không dựng lại chữ, ảnh hoặc các thành phần trang trí. Các lỗi chữ, vị trí hay phần cắt ảnh có sẵn trong Canva cũng được giữ nguyên. Muốn thay nội dung, chỉnh Canva rồi thay ảnh trang tương ứng.

Mỗi trang giữ nguyên tỷ lệ 4:5. Khung vừa màn hình hiển thị trọn trang, không kéo dài hay cắt thiết kế. Màn hình khác tỷ lệ vẫn có khoảng trống quanh trang; có thể dùng thu phóng để đọc chi tiết.

- Chuyển cảnh bằng mép giấy cong hé khoảng 1/3–2/3 trang.
- Hai mũi tên nét mảnh, không nền hoặc viền, nằm ở hai góc dưới trang.
- Giữ hướng dẫn “Vuốt hoặc dùng phím ← → để lật trang” bên dưới.
- Lật bằng mũi tên, phím ← →, Home/End hoặc vuốt ngang. Lặp vòng 5 → 1 → 2 và ngược lại.
- Phóng to/thu nhỏ từ 60% đến 400% bằng − / +, chụm/tách hai ngón hoặc Ctrl + con lăn. Khi phóng to, kéo để di chuyển nội dung. Bấm phần trăm hoặc Escape để trở về 100% vừa trang.
- Nội dung chữ có bản dành cho trình đọc màn hình. Nếu tắt JavaScript, cả 5 ảnh vẫn đọc được theo chiều dọc.

## Xem website

Mở `index.html` bằng trình duyệt; không cần cài thư viện hay build. Toàn bộ ảnh và font được lưu trong dự án, không phụ thuộc URL ảnh Canva có thời hạn hoặc đăng nhập Canva của khách truy cập.

Các QR cũ vẫn hoạt động: #gioi-thieu, #lang-sen, #bo-suu-tap, #cua-lo, #song-lam và #vi-giam.

## Dung lượng

Bộ web dùng 5 ảnh WebP và 2 font cho thanh điều khiển, tổng khoảng 2,33 MB tài nguyên. Chỉ tải trang đang mở, chuẩn bị thêm một trang kế tiếp khi trình duyệt rảnh; không tải trước khi bật tiết kiệm dữ liệu hoặc dùng mạng 2G.

Phần HTML/CSS dựng lại thiết kế và bộ tài nguyên rời cũ được lưu trong .qa/before-canva-images/, nằm trong .gitignore. Ảnh PNG gốc chụp từ Canva lưu trong .canva-reference/, cũng được bỏ qua khi đưa lên Git.

## Kiểm tra

Kiểm tra trên Chrome ở máy tính, điện thoại dọc và ngang: hiển thị trọn 5 ảnh đúng tỷ lệ, lặp trang hai chiều, chuyển cảnh giấy cong, vuốt, chụm/tách hai ngón, kéo trang khi phóng to, liên kết QR và Back/Forward. Chế độ giảm chuyển động bỏ hiệu ứng chuyển cảnh.
