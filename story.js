// story.js — Cốt truyện "LOST ISLAND"
const STORY_LINES = [
"--- NHỮNG VỤ MẤT TÍCH BÍ ẨN ---",
"Trong nhiều năm qua, vô số người đã mất tích ngoài khơi một cách khó hiểu.",
"Không có tín hiệu cầu cứu. Không có xác tàu. Họ đơn giản biến mất không để lại dấu vết.",
"",


"--- NGƯỜI THÂN CỦA TÔI ---",
"Một trong số những người mất tích đó là người thân của tôi.",
"Trong những vật dụng còn sót lại, tôi tìm thấy các ghi chép về một hòn đảo không tồn tại trên bất kỳ tấm bản đồ nào.",
"",

"--- TIẾNG GỌI KỲ LẠ ---",
"Sau đó, những giấc mơ kỳ lạ liên tục xuất hiện.",
"Tôi nhìn thấy một hòn đảo chìm trong sương mù cùng một cánh cổng đỏ khổng lồ.",
"Cảm giác như có thứ gì đó đang dẫn tôi tới nơi ấy.",
"",

"--- CUỘC TÌM KIẾM ---",
"Nhiều tháng trôi qua, tôi lần theo những tọa độ bí ẩn xuất hiện trong các ghi chép.",
"Các tọa độ liên tục thay đổi nhưng cuối cùng tôi vẫn tìm được vùng biển được nhắc đến.",
"",

"--- BIỂN SƯƠNG ---",
"Ngay khi tiến vào khu vực đó, một màn sương dày đặc bao phủ toàn bộ con tàu.",
"La bàn quay loạn, thiết bị định vị mất tín hiệu và liên lạc hoàn toàn biến mất.",
"",

"--- KHOẢNG TRỐNG KÝ ỨC ---",
"Điều cuối cùng tôi nhớ là một âm thanh kỳ lạ vọng ra từ sâu trong màn sương.",
"Sau đó... mọi thứ chìm vào bóng tối.",
"",

"--- TỈNH DẬY ---",
"Khi mở mắt ra, tôi đã nằm trên một hòn đảo xa lạ.",
"Xung quanh là những công trình đổ nát, vũ khí bỏ lại và dấu vết của những người từng đến đây.",
"",

"--- KHÔNG CÓ LỐI THOÁT ---",
"Những ghi chép còn sót lại cho thấy nhiều người đã cố gắng rời khỏi hòn đảo.",
"Nhưng không một ai thành công.",
"",

"--- NHIỆM VỤ DÀNH CHO TÔI ---",
"1. THU THẬP các HỘP THÔNG TIN để tìm ra sự thật.",
"2. TIÊU DIỆT sinh vật đột biến và sinh tồn bằng mọi giá.",
"3. TIẾN ĐẾN trung tâm hòn đảo và khám phá bí mật của Cánh Cửa Đỏ.",
"",

"Những Hộp Thông Tin sẽ xuất hiện nhiều hơn tùy theo chế độ chơi.",
"Hãy thu thập chúng để ghép lại toàn bộ câu chuyện...",
"VÀ TÌM RA ĐIỀU GÌ ĐANG CHỜ ĐỢI PHÍA SAU CÁNH CỬA ĐỎ."

];


window.startStory = function () {
    if (window.logToDiscord) {
        window.logToDiscord(`📖 **${window.STATE?.playerName || 'Người chơi vô danh'}** vừa bấm VÀO TRÒ CHƠI và đang xem cốt truyện.`);
    }

    const splashScreen = document.getElementById('splash-screen');
    const storyScreen = document.getElementById('story-screen');
    const storyContainer = document.getElementById('story-text-container');
    const btnSkip = document.getElementById('btn-skip-story');

    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.style.display = 'none', 800);
    }

    storyScreen.classList.remove('hidden');
    storyScreen.style.opacity = '1';

    let currentLine = 0;
    let isSkipped = false;
    let typeTimeout = null;

    function endStory() {
        if (isSkipped) return;
        isSkipped = true;
        storyScreen.style.opacity = '0';
        setTimeout(() => {
            storyScreen.classList.add('hidden');
            storyContainer.innerHTML = '';
        }, 1500);
        const chillTheme = document.getElementById('chill-theme-sound');
        if (chillTheme) {
            chillTheme.volume = 0.45;
            chillTheme.play().catch(() => { });
        }
    }

    btnSkip.onclick = () => {
        if (window.logToDiscord) {
            window.logToDiscord(`⏭️ **${window.STATE?.playerName || 'Người chơi vô danh'}** đã bấm SKIP bỏ qua cốt truyện.`);
        }
        clearTimeout(typeTimeout);
        endStory();
    };

    // Tốc độ mặc định (Chậm để đọc trên mobile)
    let speedMode = 1; // 1 = x1, 2 = x2, 3 = x3
    let charSpeed = 45;
    let lineSpeed = 2200;

    const getBaseSpeed = () => {
        if (speedMode === 2) return { char: 20, line: 1000 };
        if (speedMode === 3) return { char: 5, line: 300 };
        return { char: 45, line: 2200 };
    };

    // Đè vào màn hình để tua nhanh
    const speedUp = () => { charSpeed = 5; lineSpeed = 300; };
    const slowDown = () => {
        const base = getBaseSpeed();
        charSpeed = base.char;
        lineSpeed = base.line;
    };

    // Lập trình sự kiện cho nút Tua Tốc Độ Cốt Truyện mở đầu
    const btnSpeedStory = document.getElementById('btn-speed-story');
    if (btnSpeedStory) {
        btnSpeedStory.innerText = '⚡ x1';
        btnSpeedStory.onclick = (e) => {
            e.stopPropagation(); // Ngăn sự kiện chạm/click lan ra màn hình gây trigger mousedown/touchstart
            speedMode = speedMode === 3 ? 1 : speedMode + 1;
            btnSpeedStory.innerText = `⚡ x${speedMode}`;
            
            // Đồng bộ ngay lập tức tốc độ hiện tại
            const base = getBaseSpeed();
            charSpeed = base.char;
            lineSpeed = base.line;
        };
        // Ngăn chặn mousedown/touchstart trên nút speed khỏi kích hoạt speedUp/slowDown
        btnSpeedStory.addEventListener('mousedown', (e) => e.stopPropagation());
        btnSpeedStory.addEventListener('touchstart', (e) => e.stopPropagation());
    }

    storyScreen.addEventListener('mousedown', speedUp);
    storyScreen.addEventListener('touchstart', speedUp);
    storyScreen.addEventListener('mouseup', slowDown);
    storyScreen.addEventListener('mouseleave', slowDown);
    storyScreen.addEventListener('touchend', slowDown);
    storyScreen.addEventListener('touchcancel', slowDown);

    function typeLine() {
        if (isSkipped) return;
        if (currentLine >= STORY_LINES.length) {
            typeTimeout = setTimeout(endStory, 2500);
            return;
        }

        const lineText = STORY_LINES[currentLine];
        const p = document.createElement('p');
        p.className = 'story-paragraph typing'; // Chỉ định class typing để hiển thị con trỏ nhấp nháy xanh
        storyContainer.appendChild(p);
        storyContainer.scrollTo({ top: storyContainer.scrollHeight, behavior: 'smooth' });

        let charIndex = 0;
        function typeChar() {
            if (isSkipped) return;
            if (charIndex < lineText.length) {
                p.textContent += lineText.charAt(charIndex);
                charIndex++;
                typeTimeout = setTimeout(typeChar, lineText === '' ? 0 : charSpeed);
            } else {
                p.classList.remove('typing'); // Gõ xong dòng: Ẩn ngay con trỏ nhấp nháy xanh
                currentLine++;
                typeTimeout = setTimeout(typeLine, lineText === '' ? 300 : lineSpeed);
            }
        }
        typeChar();
    }

    setTimeout(typeLine, 1000);
};
