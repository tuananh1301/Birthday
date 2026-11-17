# Một món quà dành riêng cho em ♡

Website sinh nhật bằng React + TypeScript + Vite, dùng hoàn toàn tài nguyên cục bộ, bao gồm font Lora hỗ trợ tiếng Việt và nhạc nền. Không có backend, đăng nhập hoặc dịch vụ nhận ảnh bên ngoài.

## Chạy trên máy

Cần Node.js 20.19+ (hoặc 22.12+) và npm.

```sh
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal (thường là http://localhost:5173). Để xem trên điện thoại cùng Wi-Fi, dùng địa chỉ Network trong terminal; máy cần cho phép cổng dev qua firewall.

```sh
npm run build
npm run preview
```

Bản tĩnh nằm ở `dist/`. Có thể phục vụ bằng static hosting khi bạn muốn; dự án chưa được triển khai công khai. Không mở trực tiếp `index.html` bằng `file://` vì trình duyệt cần HTTP để đọc thư và manifest.

## Thay ảnh của hai vợ chồng

1. Đặt ảnh vào `public/photos/`, có thể dùng thư mục con.
2. Hỗ trợ `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, không phân biệt hoa/thường. Tên có khoảng trắng và dấu tiếng Việt được mã hóa URL tự động.
3. **Sau khi thêm/xóa ảnh, khởi động lại dev server hoặc build lại.** Script tự sinh `public/photos-manifest.json` trước dev/build; không cần khai báo tên ảnh trong code.

Nếu không tìm thấy ảnh thật, website dùng tám SVG cục bộ trong `public/demo/`. Khi có ảnh thật, manifest chỉ chứa ảnh thật, không trộn demo. Không gửi ảnh lên dịch vụ khác. Khi tự xuất bản, nhớ rằng ảnh trong `public/` sẽ có thể truy cập công khai trên hosting bạn chọn.

Ảnh được xáo trộn một lần cho mỗi lượt mở quà. Hàng đợi tải tối đa 4 ảnh; mỗi ảnh có timeout 8 giây. Ảnh lỗi được bỏ qua có thông báo nhẹ. Mỗi ảnh bay từ ngoài màn hình với kích thước lớn, thu nhỏ dần và đáp thẳng vào vị trí cuối cùng trong trái tim. Ảnh đã đáp giữ nguyên vị trí; ảnh cuối đáp xuống là tim hoàn chỉnh và có thể mở thư, không có bước gom ảnh riêng.

Bố cục mặc định gồm **40 vị trí riêng**: đặt 40 ảnh vào `public/photos/` sẽ có đúng một ảnh ở mỗi vị trí, không lặp và không có ảnh lớn che các ảnh khác. Nếu ít hơn 40 ảnh (hoặc có ảnh tải lỗi), lặp lại những ảnh tải được để lấp đầy 40 ô; các ảnh lặp cũng bay vào tuần tự. Nếu nhiều hơn 40 ảnh, số ô tự tăng để mỗi ảnh vẫn có chỗ riêng. Ảnh luôn dùng `object-fit: contain` để giữ trọn khung hình. Nếu toàn bộ ảnh lỗi, dùng biểu tượng trái tim cục bộ để vẫn mở được thư. Với 40 ảnh, phần ghép tim kéo dài khoảng 48–50 giây trên điện thoại với cấu hình mặc định.

## Thay bức thư

Sửa **`public/letter.txt`**, lưu mã hóa **UTF-8**. Nội dung, dấu tiếng Việt, dấu câu, xuống dòng và chữ ký được giữ nguyên. Văn bản luôn được hiển thị thuần, kể cả khi có ký tự HTML. Nếu chưa có file, script tạo thư mẫu; script không ghi đè file đã có. Nếu file tồn tại nhưng trống, website giữ đúng nội dung trống đó.

Ký tự được tách bằng `Intl.Segmenter` để dấu tổ hợp đi cùng chữ. Vị trí đích được đo bằng `Range` từ bố cục văn bản thật. Chỉ tối đa 160 ký tự trong vùng nhìn được dựng thành hạt bay để thư dài vẫn nhẹ; sau hiệu ứng toàn bộ văn bản thật hiện ra và cuộn/chọn/copy được. Khi cuộn hoặc đổi kích thước trong lúc ghép chữ, thư hoàn chỉnh hiện ngay để tránh sai vị trí. Trình duyệt thiếu `Intl.Segmenter` và chế độ giảm chuyển động hiển thị thư bằng chuyển cảnh nhẹ.

## Nhạc nền

Nhạc hiện dùng **`public/music/NgayDauTien.mp3`**, phát lặp với âm lượng mặc định 28%. Nhạc chỉ bắt đầu khi chạm mở quà hoặc chạm nút nốt nhạc; mở trang không tự tải/phát nhạc. Nhạc tiếp tục qua các màn và khi xem lại món quà, không bắt đầu bài hát lại. Nút **Nhạc nền** ở góc trên bên phải luôn cho phép tắt/bật, có nhãn cho trình đọc màn hình và dùng được bằng bàn phím. Thanh đầu trang giữ vị trí khi cuộn thư để nút không nằm đè lên chữ đang đọc. Tắt là tạm dừng; bật lại tiếp tục từ vị trí cũ. Lựa chọn tắt được giữ trong lần mở trang, kể cả khi replay.

Để thay nhạc, thay file trên hoặc sửa `config.music.source` trong **`src/config.ts`** theo đường dẫn tương đối trong `public/` (ví dụ `music/Bài hát của em.mp3`). Không cần đổi tên file thành `birthday.mp3`. Chỉnh `config.music.volume` từ 0 đến 1; trên một số điện thoại, âm lượng do hệ điều hành điều khiển. Build lại nếu xem bản `dist/`. File được phục vụ cục bộ, không gọi dịch vụ phát nhạc bên ngoài.

Nếu trình duyệt chặn phát nhạc hoặc file tải lỗi, nút hiện gợi ý thử lại; phần quà, ảnh và thư vẫn tiếp tục bình thường. Không có nhiều bản nhạc chạy chồng khi chạm liên tiếp. Tải lại trang bắt đầu một lượt mới và chờ thao tác trước khi phát nhạc.

## Chỉnh màu và tốc độ

Sửa **`src/config.ts`**:

- `colors`: nền, giấy, hồng, màu chữ và chữ phụ.
- `timing`: mở nắp 1300ms, ảnh bay dùng trung bình `flightMin`/`flightMax` (mặc định 4600ms), khoảng cách 600–900ms, mờ ảnh 1500ms, chữ bay 2200ms, trễ mỗi dòng 180ms và nhịp nhóm chữ 38ms; thời gian tính bằng mili giây. Các ảnh bay trong cùng thời lượng để giữ thứ tự đáp, ảnh bắt đầu cuối cùng cũng đáp cuối cùng.
- `mobileFlightConcurrency` / `desktopFlightConcurrency`: tối đa ảnh đang bay. Khi đạt giới hạn, hàng đợi đợi ảnh trước hoàn thành rồi mới cho ảnh tiếp theo bay.
- `loadingConcurrency`, `imageTimeout`, `letterParticleLimit`: tải tài nguyên và hiệu năng. `imageTimeout` nằm trong `timing`.
- `heartStyle`: độ nghiêng, kích thước ảnh lúc bay vào (`entryWidth`), nhịp đập, tốc độ trang trí nổi nhẹ và màu hào quang. Vị trí 40 ô được định nghĩa trong `src/heart-layout.ts`.
- `atmosphere`: tốc độ các quầng màu, cánh hoa và đốm sáng nền. Màu nền ánh hồng/đào/xanh nhạt nằm trong `colors` với tiền tố `mist-`. Nền dùng CSS, SVG cục bộ, không tải tài nguyên từ dịch vụ khác.

Phần giấy thư được trang trí bằng hoa ép SVG, tem trái tim, vân giấy, viền mảnh, góc giấy gấp và dấu sáp ở cuối thư. Trang trí tách khỏi `.letter-text`, không sửa nội dung hoặc chữ ký trong file. Sửa `src/stationery.css` để chỉnh thiệp và `src/atmosphere.css` để chỉnh nền. Hiệu ứng nền tự dừng khi bật giảm chuyển động.

Website tự tôn trọng `prefers-reduced-motion`. Touch, chuột và bàn phím đều được hỗ trợ; khi tim sẵn sàng, Enter/Space mở lời chúc. Nút cuối thư bắt đầu lại từ hộp quà.

## Bồ câu gửi thư

Sau khi chạm tim, chim bồ câu mang cuộn thư bay từ bên trái vào phía trên màn hình, thả thư ở giữa và bay đi. Cuộn thư rơi xuống rồi bung lớn dần thành chính tờ thư thật. Chữ bắt đầu ghép vào khi giấy trải xong; nội dung vẫn đọc nguyên văn từ `letter.txt`.

Chỉnh thời gian trong `config.delivery`: `flyIn` (3200ms), `flyOut` (2400ms), `drop` (1400ms), `spread` (1400ms), `unfold` (6200ms), `wingbeat` (1100ms). Sau khi rơi, cuộn giấy mở rộng sang hai bên trong nhịp `spread`; sau đó tờ giấy giữ nguyên chiều rộng và kích thước, trải từ trên xuống dưới trong nhịp `unfold`. Mép cuộn có tiết diện giấy ở hai đầu, lăn theo đúng mép giấy lộ ra; đây không phải phóng to cả tờ giấy. Chữ chỉ bay vào sau khi trải xong.

Hình chim bồ câu hoạt hình 2D nét viền/màu phẳng nằm trong `Dove.tsx`; cuộn giấy dùng CSS trong `delivery.css`, chuyển động điều khiển trong `LetterArrival.tsx`. Không tải tài nguyên bên ngoài. Điểm thả và phần giấy trải ra được đo từ layout thư thật; thư dài chỉ animate phần giấy trong vùng nhìn để tránh dựng một cuộn giấy khổng lồ.

Khi xoay màn hình hoặc cuộn trong lúc giao thư, website chuyển ngay sang tờ thư thật để không dùng tọa độ cũ. Chế độ giảm chuyển động dùng chuyển cảnh mờ nhẹ thay cho chim bay và thư rơi. Các animation, RAF và listener được hủy khi kết thúc hoặc replay.

## Nền sinh nhật

Cả ba màn có dây cờ pastel, bánh sinh nhật với nến chuyển động nhẹ, bóng bay, giấy màu và gà con đội mũ tiệc với dải năm sinh **2005**. Không tự suy ra tuổi. Các hình 2D dùng SVG cục bộ trong `BirthdayArt.tsx`, bố trí/chuyển động trong `birthday.css`. Đổi năm ở `config.birthday.birthYear`; chỉnh nhịp trang trí qua `float` và `confettiFall`. Màn thư có bố trí riêng trên điện thoại để giữ trống vùng đọc. Tất cả trang trí nằm sau nội dung, không nhận thao tác và dừng chuyển động trong chế độ reduced motion.

## Kiểm tra

```sh
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Kiểm thử trình duyệt chạy bằng Chromium: luồng đầy đủ, replay, bàn phím, chữ bay, nội dung thư khớp file, không tràn ngang ở 360/390/430/1440px; một ảnh và ảnh lỗi, nhiều ảnh, thư dài, xoay viewport, chạm liên tiếp, reduced motion, tải thư lỗi và thử lại. Phần nhạc kiểm tra phát từ thao tác, âm lượng/phát lặp, tiếp tục qua các màn, giữ lựa chọn tắt khi replay, tiếp tục vị trí cũ khi bật lại, thao tác bàn phím, vị trí nút khi cuộn thư, trình duyệt chặn phát, file lỗi và tắt khi đang tải. Ảnh chụp kiểm tra được ghi vào `test-results/` (không đưa vào bản build). Chưa kiểm tra trên thiết bị iOS/Android thật.
