# Sắc Xanh Xứ Nghệ

Website dạng sách/menu với 5 trang theo [thiết kế Canva](https://www.canva.com/design/DAHZ-cb46Rw/cSeUMLy4NEadVp3hpzzDtA/edit) và ảnh đối chiếu người dùng cung cấp. Gồm Giới thiệu, Làng Sen quê Bác, Cửa Lò bến nhớ, Dấu ấn Sông Lam và Ví Dặm tình ca.

- Mỗi lần hiển thị một trang vừa màn hình. Chuyển cảnh bằng mép giấy cong hé khoảng 1/3–2/3 trang, không xoay cả tờ giấy 180°.
- Hai mũi tên nằm ở hai góc dưới của trang; không có mục lục hoặc thanh tiêu đề/số trang dưới cùng.
- Mũi tên nét mảnh, không nền hoặc viền; dòng “Vuốt hoặc dùng phím ← → để lật trang” nằm dưới trang.
- Lật bằng mũi tên, phím ← →, Home/End, hoặc vuốt ngang. Các trang lặp vòng: 5 → 1 → 2 và ngược lại.
- Các nút − / + hoặc chụm/tách hai ngón thay đổi tỷ lệ từ 60% đến 400%, giữ nguyên tỷ lệ rộng/cao của trang. 100% là vừa màn hình; bấm vào phần trăm hoặc Escape để trở về 100%. Tỷ lệ được giữ khi chuyển trang.
- Khi đang phóng to, kéo để di chuyển nội dung thay vì lật trang. Trên máy tính cũng có thể dùng Ctrl + con lăn chuột trong khung trang để đổi tỷ lệ.
- Dùng ảnh Canva thật: ảnh sản phẩm lớn, chân dung Bác, giấy, mặt nước, hoa sen, mây, trống đồng, tre, cành hoa và nốt nhạc.
- Dùng đúng các font trong thiết kế, lưu tại `assets/fonts/`: Capitaly Script, Dancing Script, Crimson Roman, Linux Biolinum, TAN Astoria, Muli, TT Ramillas, Lato, 1FTV Aloevera, 1FTV Keong và DM Sans.
- Giữ nguyên phần chữ giới thiệu sản phẩm, chỉ sửa lỗi gõ rõ ràng như “Biến Cửa Lò” thành “Biển Cửa Lò”.
- Phần Làng Sen dùng khung tem nâu theo ảnh chốt của người dùng.

## Xem website

Mở `index.html` bằng trình duyệt. Không cần cài thư viện hoặc build. Font và ảnh đã lưu trong dự án, không phụ thuộc link Canva có thời hạn.

`book.css` định dạng khung sách và mặt giấy; `script.js` xử lý lật trang, lịch sử trình duyệt, vuốt và phóng to bằng API trình duyệt. Không có thư viện lật sách hoặc CDN bên ngoài. Nếu tắt JavaScript, toàn bộ nội dung vẫn đọc được theo chiều dọc.

Có thể dùng HTTP server từ thư mục này:

```sh
python -m http.server 8000
```

Các đường dẫn QR được giữ: `#gioi-thieu`, `#lang-sen`, `#bo-suu-tap`, `#cua-lo`, `#song-lam`, `#vi-giam`.

## Ảnh và dung lượng

Bộ web chỉ giữ các tài nguyên đang dùng: 42 ảnh WebP và 11 file font, khoảng 3,73 MB thay cho 24,25 MB trước tối ưu. Ảnh được giảm kích thước và nén theo mục đích hiển thị; giữ nguyên tỷ lệ ảnh và font thiết kế.

Các bản trùng, ảnh xem thử cũ, danh mục ảnh và trang `anh-canva.html` đã được đưa khỏi bộ web. Bản ảnh gốc được lưu trong `.qa/perf-originals/`, nằm trong `.gitignore` để có thể khôi phục mà không đưa lên Git.

Chỉ tải ảnh và font cần cho trang đang mở; trang kế tiếp được chuẩn bị khi trình duyệt rảnh. Không tải trước trang kế tiếp khi trình duyệt báo tiết kiệm dữ liệu hoặc kết nối 2G. Kích thước ảnh được khai báo sẵn để hạn chế nhảy bố cục.

Trong phép đo tải mới bằng Chrome qua HTTP local, gồm trang đầu và phần chuẩn bị trang kế tiếp, lượng dữ liệu giảm từ khoảng 3,94 MB xuống 1,59 MB (khoảng 60%). Đây là lượng dữ liệu tài nguyên, không phải cam kết thời gian tải trên mọi kết nối.

Ảnh đan tre ở góc dưới trang mở đầu đã bị cắt sát mép trái ngay trong file nguồn Canva. Ảnh được đặt trực tiếp theo mép ngoài của phần giới thiệu để không lộ đường cắt giữa trang. Muốn hiển thị trọn vòng tròn cần thay bằng ảnh chưa cắt. Ảnh sản phẩm giữ tỷ lệ nguồn, không ép vào khung dùng `object-fit: cover`.

## Kiểm tra

Đã kiểm tra trên Chrome ở máy tính, điện thoại 390/320 px và điện thoại xoay ngang. Bao gồm vòng lặp hai chiều, vị trí mũi tên theo góc trang, chuyển cảnh giấy cong, phím điều hướng, Back/Forward, liên kết QR cũ, vuốt, chụm/tách hai ngón, kéo trang và tỷ lệ ảnh không biến dạng. Mỗi thời điểm chỉ một trang hoạt động; trạng thái trang chỉ được thông báo cho trình đọc màn hình. Chế độ giảm chuyển động bỏ hiệu ứng chuyển cảnh. Nội dung vẫn đọc được khi tắt JavaScript.
