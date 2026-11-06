# Sắc Xanh Xứ Nghệ

Website tĩnh tiếng Việt, triển khai theo **5 trang đầu** của [thiết kế Canva](https://www.canva.com/design/DAHZ-cb46Rw/cSeUMLy4NEadVp3hpzzDtA/edit):

1. Giới thiệu — nền giấy kem, tiêu đề lớn, ảnh khung tem.
2. Làng Sen quê Bác — giấy ô xanh bạc hà, họa tiết hoa sen.
3. Cửa Lò bến nhớ — cảnh biển, bố cục tiêu đề và ảnh bên trái, nội dung bên phải.
4. Dấu ấn Sông Lam — khung giấy cổ điển, họa tiết tre và sóng nước.
5. Ví, giặm tình ca — nền xanh, giấy xé, cành hoa và nốt nhạc.

Nội dung từ Canva được giữ đầy đủ, sửa các lỗi gõ rõ ràng. Trang thứ 6 (“Nong mốt”) không nằm trong phạm vi 5 trang. Nội dung là HTML thật, tự xếp lại trên điện thoại; mỗi phần có liên kết riêng để dùng làm đích QR: `#gioi-thieu`, `#lang-sen`, `#cua-lo`, `#song-lam`, `#vi-giam`. Thanh điều hướng đánh dấu phần đang đọc.

## Chạy local

Mở `index.html` trực tiếp, hoặc chạy HTTP server từ thư mục này:

```sh
python -m http.server 8000
```

Mở http://localhost:8000. Không cần cài thư viện hay build. JavaScript chỉ phục vụ đánh dấu điều hướng; toàn bộ nội dung và liên kết vẫn hoạt động khi tắt JavaScript.

## Hình ảnh

Ảnh trong `assets/` là các ảnh đã có trong dự án. Ảnh sản phẩm của bốn chủ đề hiện là ảnh thu nhỏ khoảng 150 px; cần thay bằng ảnh gốc để hiển thị sắc nét ở kích thước lớn. Một số asset riêng tư Canva chưa cho phép truy cập trực tiếp. Các họa tiết được dựng lại bằng SVG/CSS, vì vậy giao diện là bản HTML thích ứng theo bố cục Canva, không phải bản xuất nguyên trang.

## Đưa lên GitHub Pages

Đẩy nội dung thư mục này lên repository, chọn **Settings → Pages → Deploy from a branch**, chọn nhánh và thư mục chứa `index.html`. Dùng địa chỉ Pages làm đích cho mã QR.
