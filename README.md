# Sắc Xanh Xứ Nghệ

Website dạng sách/menu với 5 trang theo [thiết kế Canva](https://www.canva.com/design/DAHZ-cb46Rw/cSeUMLy4NEadVp3hpzzDtA/edit) và ảnh đối chiếu người dùng cung cấp. Gồm Giới thiệu, Làng Sen quê Bác, Cửa Lò bến nhớ, Dấu ấn Sông Lam và Ví Dặm tình ca.

- Mỗi lần hiển thị một trang vừa màn hình, chuyển bằng hiệu ứng lật giấy 3D. Không cuộn dài qua các chủ đề.
- Lật bằng nút Trang trước/Trang sau, phím ← →, Home/End, hoặc vuốt ngang trên điện thoại. Thanh mục lục mở trực tiếp từng chủ đề.
- Nút Phóng to cho phép kéo xem chi tiết trong trang hiện tại; Vừa trang hoặc Escape thu nhỏ lại. Chuyển trang sẽ trở về chế độ vừa màn hình.
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

## Kiểm tra, thay ảnh

Mở `anh-canva.html` để xem 62 ảnh nguồn và biến thể màu / hiệu ứng / tách nền lấy từ dữ liệu thiết kế. Ảnh được nhóm theo từng chủ đề, kèm mã và kích thước. Mục bổ sung chứa những phiên bản hiệu ứng khác.

Danh mục không chứa URL ký số hoặc thông tin truy cập: `assets/canva/manifest.json`. Thay ảnh cùng đường dẫn sẽ giữ được bố cục hiện tại. Các ảnh WebP cũ nằm ngay trong `assets/` được giữ lại; website dùng bộ ảnh mới trong `assets/canva/`.

Ảnh đan tre ở góc dưới trang mở đầu đã bị cắt sát mép trái ngay trong file nguồn Canva. Ảnh được đặt trực tiếp theo mép ngoài của phần giới thiệu để không lộ đường cắt giữa trang. Muốn hiển thị trọn vòng tròn cần thay bằng ảnh chưa cắt. Ảnh sản phẩm giữ tỷ lệ nguồn, không ép vào khung dùng `object-fit: cover`.

## Kiểm tra

Đã kiểm tra trên Chrome ở máy tính, điện thoại 390/320 px và điện thoại xoay ngang. Bao gồm đủ 5 trang, hiệu ứng 3D, mặt sau giấy, phím điều hướng, mục lục, Back/Forward, liên kết QR cũ, thao tác vuốt thật, phóng to và kéo nội dung. Mỗi thời điểm chỉ một trang hoạt động; các trang còn lại được ẩn với trình đọc màn hình và bàn phím. Chế độ giảm chuyển động bỏ hiệu ứng lật. Nội dung vẫn đọc được khi tắt JavaScript.
