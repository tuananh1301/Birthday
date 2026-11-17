# Món quà sinh nhật

Thiết kế theo yêu cầu đã cung cấp: React, TypeScript, Vite; dữ liệu cục bộ, không backend. Giấy kem, hồng đất, hộp quà SVG/CSS và chữ serif dễ đọc có tiếng Việt. Không dùng dịch vụ ảnh hoặc font bên ngoài.

- [x] Script asset: quét đệ quy ảnh thật, mã hóa từng đoạn URL, không trộn demo; tạo thư mẫu chỉ khi thiếu.
- [x] Luồng: gift → opening → loading → flying → heart → fading → letter; khóa tương tác theo giai đoạn.
- [x] PhotoStage: mỗi ảnh thu nhỏ và đáp trực tiếp vào một ô tim, 40 ảnh có đúng 40 ô; không có bước hội tụ riêng; giới hạn ảnh bay, cleanup, resize và reduced motion.
- [x] Letter: văn bản thật, grapheme và Range đo layout; overlay chữ bay theo vùng nhìn; cleanup, resize và reduced motion.
- [x] Kiểm tra: unit asset/scheduler/grapheme; trình duyệt 360/390/430/desktop, replay, spam tap, lỗi ảnh, một/nhiều ảnh, thư dài; build/typecheck/lint.
- [x] README: hướng dẫn tài nguyên, cấu hình và lệnh chạy. Không deploy.

Kết quả kiểm chứng bản ghép tim trực tiếp: build (kèm TypeScript), lint, 2 unit test và 11 Chromium test đều qua. Kiểm thử đo ảnh thu nhỏ, xác nhận vị trí ảnh đã đáp không đổi khi ảnh thứ 40 hoàn tất, replay và xoay màn hình trong lúc bay. Đã xem ảnh chụp giữa luồng và khi hoàn tất trên mobile, ảnh hoàn tất desktop. Chưa thử thiết bị thật. Preview cục bộ cổng 4173, không deploy công khai.

Bản nền và giấy thư: ảnh bay 4600ms, chữ bay 2200ms; nền có quầng màu/cánh hoa/đốm sáng CSS, dừng khi giảm chuyển động. Thư thêm hoa ép SVG, tem trái tim, vân giấy, viền, góc gấp và dấu sáp. Đã kiểm tra nguyên văn thư, không tràn ngang, đo thời gian animation thực tế và chạy lại 11 Chromium test (đều qua); xem ảnh chụp 360/390/430/1440px.

Bản bồ câu gửi thư: sau ảnh mờ, chim mang cuộn thư bay ngang phía trên, thả tại giữa, bay ra; cuộn giấy rơi rồi bung lớn thành chính article thư thật. Vị trí thả đo từ layout; RAF bám mép giấy thật khi bung. Hoàn tất bung mới bắt đầu ghép chữ. Resize/scroll/reduced-motion hoàn tất ngay để không giữ đích cũ; cleanup WAAPI/RAF/listener. Build, TypeScript, lint, 2 unit test và 16 Chromium test đều qua. Đã xem ảnh chụp chim mang thư/thả thư/giấy bung, kiểm tra trực tiếp thư 300 đoạn (layout cao 27814px), nội dung nguyên vẹn, không tự cuộn và replay reset đúng. Không deploy công khai.

Bản trải thư và sinh nhật 2005: cuộn giấy mở rộng ngang 1400ms rồi giấy giữ nguyên chiều rộng/scale, chỉ lộ dần từ trên xuống trong 6200ms; mép cuộn 24px có tiết diện giấy ở hai đầu. Chim thay bằng hoạt hình 2D nét viền/màu phẳng. Nền ba màn thêm bánh nến, gà con mũ tiệc/dải2005, bóng bay, dây cờ và giấy màu; có bố trí riêng trên mobile để không che vùng đọc. Build/TypeScript/lint, 2 unit và 16 Chromium test đều qua, gồm kiểm tra chiều rộng không đổi khi trải và mép cuộn bám giấy. Đã xem ảnh chụp cả ba màn ở360/390/430/1440px và các nhịp trải thư, không tràn ngang. Không tự suy ra tuổi, không sửa nội dung thư hoặc ảnh cá nhân.

Nhạc nền theo yêu cầu bổ sung: dùng file người dùng cung cấp `public/music/NgayDauTien.mp3` (193,49 giây), volume 28%, loop. Gọi play ngay trong thao tác mở quà; audio không tải/phát trước thao tác. Một audio giữ nguyên qua các màn và replay, giữ vị trí bài hát và lựa chọn tắt. Nút tiếng Việt có aria-pressed và bàn phím; thanh đầu trang giữ vị trí khi cuộn thư để nút không đè chữ. Request counter loại bỏ lỗi từ promise cũ khi chạm liên tiếp; cleanup pause khi unmount. File lỗi/chặn phát có thể thử lại, không chặn luồng quà. Đã xác nhận test thất bại trước khi thêm audio, rồi 23 Chromium test qua; chạy lại riêng 7 test nhạc với kiểm tra cuộn thư ở360/390/430/1440px đều qua. Kiểm tra thủ công trên trình duyệt: hết bài lặp thật, replay đang phát không tua về đầu, tắt trước khi mở quà không bị bật lại; đã xem ảnh chụp nút và thư đang cuộn. File MP3 trong dist có SHA256 khớp file gốc. Không deploy công khai; chưa thử thiết bị thật.
