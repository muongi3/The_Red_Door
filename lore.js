// lore.js — Hệ thống Nhiệm vụ Tâm Linh & Mảnh Giấy

window.LoreSystem = {
    // Get unlocked secrets from localStorage
    getUnlocked: function () {
        const saved = localStorage.getItem('unlocked_space_secrets');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // Ignore parsing error
            }
        }
        return {
            easy: [],
            normal: [],
            hard: [],
            extreme: []
        };
    },

    // Save unlocked secrets to localStorage
    saveUnlocked: function (unlocked) {
        localStorage.setItem('unlocked_space_secrets', JSON.stringify(unlocked));
    },

    // Unlock a secret by difficulty and index
    unlockSecret: function (difficulty, index) {
        const unlocked = this.getUnlocked();
        if (!unlocked[difficulty]) unlocked[difficulty] = [];
        if (!unlocked[difficulty].includes(index)) {
            unlocked[difficulty].push(index);
            this.saveUnlocked(unlocked);
        }
    },

    // Calculate total unlocked secrets
    getTotalUnlockedCount: function () {
        const unlocked = this.getUnlocked();
        let total = 0;
        ['easy', 'normal', 'hard', 'extreme'].forEach(diff => {
            if (unlocked[diff]) total += unlocked[diff].length;
        });
        return total;
    }
};

// Kho Lore theo độ khó: Càng khó thì thông tin bí ẩn càng// Kho Lore theo độ khó: Càng khó thì thông tin bí ẩn càng tăng chi tiết và hấp dẫn!
const LORE_BY_DIFFICULTY = {
    easy: [
        { idx: 0, text: "\"Nếu ai đó đọc bản ghi này, thì đã không còn có thể thoát ra khỏi màn sương xung quanh hòn đảo này rồi.\"" },
        { idx: 1, text: "\"Chúng tôi không phải những người đầu tiên đặt chân lên hòn đảo này.\"" },
        { idx: 2, text: "\"Có thứ gì đó đang quan sát chúng tôi từ trung tâm hòn đảo.\"" }
    ],


    normal: [
        { idx: 0, text: "\"Ký ức của tôi về thế giới bên ngoài đang dần biến mất.\"" },
        { idx: 1, text: "\"Những sinh vật trên đảo dường như từng là con người.\"" },
        { idx: 2, text: "\"Tất cả những người sống sót cuối cùng đều tìm cách tới trung tâm hòn đảo.\"" },
        { idx: 3, text: "\"Con quái vật đó luôn xuất hiện gần một cánh cổng màu đỏ khổng lồ.\"" },
        { idx: 4, text: "\"Chúng tôi tin rằng tiêu diệt nó là cách duy nhất để thoát khỏi nơi này.\"" }
    ],

    hard: [
        { idx: 0, text: "\"Tôi không còn nhớ chính xác mình tới đây bằng cách nào.\"" },
        { idx: 1, text: "\"Những con quái vật này không chỉ săn mồi... chúng đang ngăn chúng tôi tiến sâu hơn.\"" },
        { idx: 2, text: "\"Một số ghi chép cũ gọi sinh vật ở trung tâm là Kẻ Gác Cổng.\"" },
        { idx: 3, text: "\"Không ai biết điều gì nằm phía sau Cánh Cửa Đỏ.\"" },
        { idx: 4, text: "\"Những người tiến gần cánh cửa thường nghe thấy những lời thì thầm kỳ lạ.\"" },
        { idx: 5, text: "\"Có điều gì đó không đúng. Tại sao tất cả chúng đều cố bảo vệ cánh cửa?\"" },
        { idx: 6, text: "\"Có lẽ chúng tôi đã hiểu sai về Kẻ Gác Cổng từ đầu.\"" }
    ],

    extreme: [
        { idx: 0, text: "\"DỮ LIỆU HỎNG: Những người mất tích không chết. Họ bị kéo tới hòn đảo này.\"" },
        { idx: 1, text: "\"DỮ LIỆU HỎNG: Không ai có thể rời khỏi đảo sau khi đã đặt chân tới đây.\"" },
        { idx: 2, text: "\"DỮ LIỆU HỎNG: Tiếp xúc lâu dài với năng lượng từ Cánh Cửa Đỏ sẽ làm mất ký ức và nhân tính.\"" },
        { idx: 3, text: "\"DỮ LIỆU HỎNG: Những kẻ thất bại sẽ dần biến thành các sinh vật đột biến.\"" },
        { idx: 4, text: "\"DỮ LIỆU HỎNG: Kẻ Gác Cổng hiện tại từng là người đã đánh bại Kẻ Gác Cổng đời trước.\"" },
        { idx: 5, text: "\"DỮ LIỆU HỎNG: Sau khi mở Cánh Cửa Đỏ, hắn đã tiếp xúc trực tiếp với nguồn năng lượng bên trong.\"" },
        { idx: 6, text: "\"DỮ LIỆU HỎNG: Hắn mất dần ký ức nhưng vẫn giữ lại một mục đích duy nhất: bảo vệ cánh cửa.\"" },
        { idx: 7, text: "\"DỮ LIỆU HỎNG: Mọi Kẻ Gác Cổng đều từng là những người tìm kiếm lối thoát khỏi hòn đảo.\"" },
        { idx: 8, text: "\"DỮ LIỆU HỎNG: Nếu ngươi đang đọc được dòng này, chu kỳ sắp bắt đầu lại.\"" }
    ]


};

window.LORE_BY_DIFFICULTY = LORE_BY_DIFFICULTY;


function getLoreFragments() {
    const diff = window.CURRENT_DIFFICULTY || 'normal';
    return LORE_BY_DIFFICULTY[diff] || LORE_BY_DIFFICULTY['normal'];
}
window.getLoreFragments = getLoreFragments;

// Kho nhiệm vụ động với đúng 8 loại nhiệm vụ hoàn toàn độc lập, khác biệt, cân bằng theo độ khó!
function getQuestPool() {
    const diff = window.CURRENT_DIFFICULTY || 'normal';

    // Cân cấu hình mục tiêu cụ thể theo từng độ khó để đảm bảo chơi vui, dễ thở mà không bị quá tải
    const config = {
        easy: {
            kill: 1,
            barrel_kill: 3,
            ultimate: 1,
            pickup_powerup: 1,
            purple_time: 15,
            survive: 30,
            heal: 400,
            headshot: 5
        },
        normal: {
            kill: 3,
            barrel_kill: 5,
            ultimate: 4,
            pickup_powerup: 2,
            purple_time: 30,
            survive: 60,
            heal: 800,
            headshot: 7
        },
        hard: {
            kill: 5,
            barrel_kill: 7,
            ultimate: 7,
            pickup_powerup: 3,
            purple_time: 45,
            survive: 90,
            heal: 1200,
            headshot: 9
        },
        extreme: {
            kill: 7,
            barrel_kill: 9,
            ultimate: 10,
            pickup_powerup: 4,
            purple_time: 60,
            survive: 130,
            heal: 1600,
            headshot: 11
        }
    };

    const c = config[diff] || config['normal'];

    return [
        { type: 'kill', target: c.kill, desc: `Hạ gục ${c.kill} sinh vật biến dị (bất kỳ cách nào)`, reward: '"Hồi 500 máu"' },
        { type: 'barrel_kill', target: c.barrel_kill, desc: `Gây sát thương bằng thùng nổ lên sinh vật ${c.barrel_kill} lần`, reward: '"Hồi đầy máu"' },
        { type: 'use_ultimate', target: c.ultimate, desc: `Kích hoạt Kỹ năng Nổ (Ultimate) ${c.ultimate} lần`, reward: '"Hồi đầy giáp"' },
        { type: 'pickup_powerup', target: c.pickup_powerup, desc: `Nhặt bình kỹ năng (Loot box cam) ${c.pickup_powerup} lần`, reward: '"Hồi đầy máu & giáp"' },
        { type: 'purple_time', target: c.purple_time, desc: `Duy trì Trạng thái Siêu cấp (Dạng Tím) trong ${c.purple_time}s`, reward: '"Hồi 500 máu"' },
        { type: 'survive', target: c.survive, desc: `Sống sót né tránh hiểm họa trong ${c.survive} giây`, reward: '"Hồi đầy giáp"' },
        { type: 'heal', target: c.heal, desc: `Hấp thụ ${c.heal} máu từ các bình hồi phục cứu sinh`, reward: '"Hồi đầy máu"' },
        { type: 'headshot', target: c.headshot, desc: `Bắn chuẩn xác trúng đầu (Headshot) quái ${c.headshot} lần`, reward: '"Hồi đầy máu & giáp"' }
    ];
}

window.QuestManager = {
    totalCollected: 0,           // Số mảnh giấy đã nhặt
    totalCompleted: 0,           // Số nhiệm vụ đã hoàn thành
    activeQuests: [],            // Hàng đợi nhiệm vụ đang làm song song
    completedTypes: [],          // Lưu các loại nhiệm vụ đã hoàn thành để KHÔNG trùng lặp
    damageTracker: 0,            // Theo dõi sát thương cho task damage
    cumulativeKills: 0,          // Tích lũy số quái đã tiêu diệt từ đầu trận
    cumulativeBarrelKills: 0,    // Tích lũy số quái nổ bình từ đầu trận
    cumulativeHeadshots: 0,      // Tích lũy số headshots từ đầu trận

    /* --- Gán nhiệm vụ khi nhặt mảnh giấy --- */
    assignQuest: function () {
        if (this.totalCollected >= getLoreFragments().length) return;
        this.totalCollected++; // Nhặt hộp là được cộng 1 ngay lập tức

        const pool = getQuestPool();
        const available = pool.filter(q =>
            !this.activeQuests.some(a => a.type === q.type) &&
            !this.completedTypes.includes(q.type)
        );
        if (available.length === 0) {
            this.updateUI();
            return;
        }

        const qData = available[Math.floor(Math.random() * available.length)];

        // Tích hợp pre-tracked progress từ đầu trận
        let startVal = 0;
        if (qData.type === 'kill') startVal = this.cumulativeKills;
        if (qData.type === 'barrel_kill') startVal = this.cumulativeBarrelKills;

        const quest = {
            id: Date.now(),
            type: qData.type,
            target: qData.target,
            current: Math.min(startVal, qData.target), // Khởi điểm bằng số lượng đã làm từ trước (tối đa bằng target)
            desc: qData.desc,
            reward: qData.reward
        };
        this.activeQuests.push(quest);
        this.checkCompletion(); // Kiểm tra xem nếu đủ rồi thì hoàn thành luôn lập tức
        this.updateUI();
        document.getElementById('quest-tracker-ui').classList.remove('hidden');
    },

    /* --- Gọi mỗi frame --- */
    update: function (dt) {
        let changed = false;
        this.activeQuests.forEach(q => {
            if (q.type === 'survive') {
                q.current += dt;
                if (q.current > q.target) q.current = q.target;
                changed = true;
            }
        });
        this.checkCompletion();
        // Cập nhật khoảng cách thời gian thực khi đang giữ Chìa Khóa Đỏ
        if (window.STATE && window.STATE.hasRedKey) {
            changed = true;
        }
        if (changed) this.updateUI();
    },

    /* --- Hook sự kiện từ game.js --- */
    onEvent: function (type, amount) {
        // Tích lũy sẵn từ đầu trận cho các nhiệm vụ liên quan đến quái (để tránh bị kẹt nếu người chơi giết quái trước khi nhận quest)
        if (type === 'kill') this.cumulativeKills += amount;
        if (type === 'barrel_kill') this.cumulativeBarrelKills += amount;
        if (type === 'headshot') this.cumulativeHeadshots += amount;

        this.activeQuests.forEach(q => {
            if (q.type === type) {
                q.current += amount;
                if (q.current > q.target) q.current = q.target;
            }
        });
        if (type === 'damage') this.damageTracker += amount;
        this.checkCompletion();
        this.updateUI();
    },

    /* --- Kiểm tra hoàn thành --- */
    checkCompletion: function () {
        const done = this.activeQuests.filter(q => q.current >= q.target);
        done.forEach(q => this.completeQuest(q));
    },

    completeQuest: function (quest) {
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        if (!this.completedTypes.includes(quest.type)) {
            this.completedTypes.push(quest.type);
        }
        this.totalCompleted = Math.min(this.totalCompleted + 1, getLoreFragments().length);

        // Thưởng theo loại
        if (window.STATE && window.GAME_CONFIG) {
            const P = window.GAME_CONFIG.player;
            const pl = window.STATE.player;
            if (quest.reward.includes('đầy máu')) pl.hp = P.maxHp;
            else if (quest.reward.includes('500')) pl.hp = Math.min(pl.hp + 500, P.maxHp);
            else if (quest.reward.includes('400')) pl.hp = Math.min(pl.hp + 400, P.maxHp);
            else if (quest.reward.includes('300')) pl.hp = Math.min(pl.hp + 300, P.maxHp);

            if (quest.reward.includes('đầy giáp')) pl.armor = P.maxArmor;
        }

        // Thông báo xanh
        const ann = document.getElementById('global-announcement');
        if (ann) {
            ann.innerText = `✅ HOÀN THÀNH: ${quest.desc} — ${quest.reward}!`;
            ann.style.color = '#00ff88';
            ann.style.opacity = '1';
            setTimeout(() => { ann.style.opacity = '0'; }, 3500);
        }

        // Hiện Lore Fragment
        const frag = getLoreFragments()[this.totalCompleted - 1];
        if (frag) {
            // Lưu giữ bí mật vào localStorage của hệ thống thành tựu vĩnh viễn
            const diff = window.CURRENT_DIFFICULTY || 'normal';
            if (window.LoreSystem) {
                window.LoreSystem.unlockSecret(diff, this.totalCompleted - 1);
            }

            const container = document.getElementById('lore-container');
            if (container) {
                container.innerText = frag.text;
                container.classList.remove('hidden');
                setTimeout(() => { container.style.opacity = '1'; }, 100);
                setTimeout(() => {
                    container.style.opacity = '0';
                    setTimeout(() => container.classList.add('hidden'), 2000);
                }, 6000);
            }
        }

        this.updateUI();
        if (this.activeQuests.length === 0)
            document.getElementById('quest-tracker-ui').classList.add('hidden');
    },

    onRedKeyPickup: function () {
        const maxFrags = getLoreFragments().length;
        this.totalCollected = Math.min(this.totalCollected + 1, maxFrags);
        this.totalCompleted = Math.min(this.totalCompleted + 1, maxFrags);

        // Hiển thị Lore Fragment của mảnh cuối cùng vừa nhận
        const frag = getLoreFragments()[this.totalCompleted - 1];
        if (frag) {
            const diff = window.CURRENT_DIFFICULTY || 'normal';
            if (window.LoreSystem) {
                window.LoreSystem.unlockSecret(diff, this.totalCompleted - 1);
            }

            const container = document.getElementById('lore-container');
            if (container) {
                container.innerText = frag.text;
                container.classList.remove('hidden');
                container.style.opacity = '0';
                setTimeout(() => { container.style.opacity = '1'; }, 100);
                setTimeout(() => {
                    container.style.opacity = '0';
                    setTimeout(() => container.classList.add('hidden'), 2000);
                }, 6000);
            }
        }

        this.updateUI();
    },

    /* --- Cập nhật UI Quest Tracker --- */
    updateUI: function () {
        // Luôn cập nhật bộ đếm mảnh giấy (dù đang trong game hay menu)
        const counter = document.getElementById('lore-counter');
        if (counter) {
            const total = getLoreFragments().length;
            counter.innerText = `📦 ${this.totalCollected} / ${total}`;
            counter.style.color = this.totalCollected >= total ? '#00ff88' : '#ffcc00';
            counter.style.textShadow = this.totalCollected >= total ? '0 0 8px #00ff88' : '';
        }

        // Cập nhật danh sách nhiệm vụ đang làm
        const list = document.getElementById('quest-list');
        if (!list) return;
        list.innerHTML = '';

        if (window.STATE && window.STATE.hasRedKey) {
            document.getElementById('quest-tracker-ui').classList.remove('hidden');
            const header = document.getElementById('quest-tracker-header');
            if (header) header.innerText = "NHIỆM VỤ CUỐI CÙNG";

            // Tính khoảng cách tới redDoor (0, -150)
            const pPos = window.STATE.player.pos;
            const dx = 0 - pPos.x;
            const dz = -150 - pPos.z;
            const distToDoor = Math.round(Math.sqrt(dx * dx + dz * dz));

            const div = document.createElement('div');
            div.className = 'quest-item';
            div.innerHTML = `
                <div class="quest-desc" style="color: #ff0055; font-weight:900; animation: pulse 0.8s infinite;">🔑 CHÌA KHÓA ĐỎ ĐÃ THU THẬP!</div>
                <div style="font-size:10px; margin-top:4px; color:#ddd; line-height: 1.3;">Chạy theo <b>VẠCH CHỈ ĐƯỜNG ĐỎ GLOW</b> để đến Cánh Cửa ở trung tâm hòn đảo!</div>
                <div style="font-size:11px; color:#ffcc00; font-weight:bold; margin-top:4px; letter-spacing: 0.5px;">📍 Khoảng cách: ${distToDoor}m</div>
            `;
            list.appendChild(div);
            return;
        }

        const header = document.getElementById('quest-tracker-header');
        if (header) header.innerText = "NHIỆM VỤ TÂM LINH";

        this.activeQuests.forEach(q => {
            const div = document.createElement('div');
            div.className = 'quest-item';
            let progressText = '';
            if (q.type === 'survive') {
                progressText = `${Math.floor(q.current)}s / ${q.target}s`;
            } else if (q.type === 'purple_time') {
                progressText = `${Math.floor(q.current)}s / ${q.target}s`;
            } else if (q.type === 'damage') {
                progressText = `${Math.floor(q.current)} / ${q.target}`;
            } else {
                progressText = `${q.current} / ${q.target}`;
            }
            const pct = Math.min(q.current / q.target * 100, 100);
            div.innerHTML = `
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-bar-wrap">
                    <div class="quest-bar-fill" style="width:${pct}%"></div>
                    <span class="quest-progress-txt">${progressText}</span>
                </div>`;
            list.appendChild(div);
        });
    }
};
