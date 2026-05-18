/**
 * spectator.js - Hệ thống Bộ đệm và Nội suy Chuyển động (Lerp Interpolation)
 * Chống giật lag (Anti-jitter) bằng cách tạo độ trễ nhân tạo 100ms.
 */

class SpectatorInterpolator {
    constructor() {
        this.buffer = [];
        this.renderDelay = 100; // Độ trễ 100ms để đảm bảo luôn có ít nhất 2 packet để nội suy
    }

    /** Đẩy state mới nhận vào bộ đệm */
    pushState(state) {
        this.buffer.push(state);
        // Sắp xếp lại theo thời gian
        this.buffer.sort((a, b) => a.ts - b.ts);
        // Giữ tối đa 60 packet gần nhất cho nhẹ bộ nhớ
        if (this.buffer.length > 60) {
            this.buffer.shift();
        }
    }

    /** Helper tính Lerp giữa 2 số */
    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    /** Helper nội suy góc quay (tránh xoay vòng tròn khi qua mốc 360 độ) */
    lerpAngle(a, b, amt) {
        let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * amt;
    }

    /** Lấy State đã nội suy mượt mà tại thời điểm (now - renderDelay) */
    getInterpolatedState() {
        const renderTime = Date.now() - this.renderDelay;
        const buf = this.buffer;

        // Nếu không đủ dữ liệu
        if (buf.length === 0) return null;
        if (buf.length === 1 || renderTime <= buf[0].ts) return buf[0];
        if (renderTime >= buf[buf.length - 1].ts) return buf[buf.length - 1];

        // Tìm 2 mốc thời gian kề nhau (S1 và S2)
        let s1 = null, s2 = null;
        for (let i = 0; i < buf.length - 1; i++) {
            if (buf[i].ts <= renderTime && buf[i+1].ts >= renderTime) {
                s1 = buf[i];
                s2 = buf[i+1];
                break;
            }
        }

        if (!s1 || !s2) return buf[buf.length - 1];

        // Tỷ lệ phần trăm giữa s1 và s2 (0 -> 1)
        const ratio = (renderTime - s1.ts) / (s2.ts - s1.ts);

        return {
            x: this.lerp(s1.x, s2.x, ratio),
            y: this.lerp(s1.y, s2.y, ratio),
            dir: this.lerpAngle(s1.dir, s2.dir, ratio),
            hp: s1.hp, // Máu không cần lerp, hoặc lerp nhẹ
            anim: s1.anim
        };
    }
}

window.Spectator = new SpectatorInterpolator();
