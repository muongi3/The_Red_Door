/**
 * renderer.js - Engine Đồ họa và Vòng lặp Game (Game Loop / Render Loop)
 */

class GameRenderer {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Độ phân giải ảo cố định (Virtual Resolution) để PC và Mobile hiển thị y hệt nhau
        this.V_WIDTH = 1920;
        this.V_HEIGHT = 1080;

        // Trạng thái nhân vật Host
        this.player = {
            x: this.V_WIDTH / 2,
            y: this.V_HEIGHT / 2,
            vx: 0, vy: 0,
            speed: 12,
            dir: 0,
            hp: 100,
            maxHp: 100,
            radius: 40
        };

        // Danh sách chướng ngại vật mẫu (Dark Horror Map)
        this.obstacles = [
            { x: 500, y: 300, r: 80, color: "#250a3a" },
            { x: 1400, y: 250, r: 120, color: "#250a3a" },
            { x: 960, y: 800, r: 100, color: "#ff003c44" },
            { x: 300, y: 850, r: 90, color: "#00f2ff44" }
        ];

        // Quản lý input cho Host
        this.keys = {};
        this.mouse = { x: 0, y: 0 };

        // Quản lý FPS
        this.lastTime = performance.now();
        this.fpsDisplay = document.getElementById('fps-text');
        this.frameCount = 0;
        this.fpsTimer = performance.now();

        // Quản lý Network Send Rate (30 FPS)
        this.lastSendTime = performance.now();
        this.sendInterval = 1000 / 30; // ~33.3ms

        this.initResize();
        this.initInput();
    }

    /** Xử lý tự động scale theo màn hình */
    initResize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    /** Xử lý phím và chuột cho Host */
    initInput() {
        window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
        window.addEventListener('mousemove', e => {
            // Quy đổi tọa độ chuột thực tế sang tọa độ thế giới ảo
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Hỗ trợ Touch trên Mobile cho Host
        window.addEventListener('touchmove', e => {
            if(e.touches.length > 0) {
                this.keys['w'] = true; // Chạm để đi tới
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
            }
        });
        window.addEventListener('touchend', () => this.keys['w'] = false);
    }

    /** Cập nhật FPS lên giao diện */
    updateFPS(now) {
        this.frameCount++;
        if (now - this.fpsTimer >= 1000) {
            if (this.fpsDisplay) this.fpsDisplay.innerText = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = now;
        }
    }

    /** Helper chuyển đổi Camera và Scale */
    applyCamera(camX, camY) {
        // Tỷ lệ scale màn hình thực tế so với thế giới ảo 1080p
        const scale = Math.min(this.canvas.width / this.V_WIDTH, this.canvas.height / this.V_HEIGHT);
        
        this.ctx.save();
        // Đặt mốc trung tâm màn hình
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        // Di chuyển camera bám theo nhân vật
        this.ctx.translate(-camX, -camY);
    }

    /** VẼ THẾ GIỚI GAME (Dùng chung cho cả Host và Viewer) */
    drawWorld(pX, pY, pDir, pHP) {
        const ctx = this.ctx;
        
        // 1. Reset màn hình
        ctx.fillStyle = "#050209";
        ctx.fillRect(-this.V_WIDTH * 2, -this.V_HEIGHT * 2, this.V_WIDTH * 4, this.V_HEIGHT * 4);

        // Lưới nền (Grid) tạo cảm giác không gian
        ctx.strokeStyle = "#1b0a2a";
        ctx.lineWidth = 2;
        const gridSize = 100;
        for (let x = -this.V_WIDTH; x < this.V_WIDTH * 2; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, -this.V_HEIGHT); ctx.lineTo(x, this.V_HEIGHT * 2); ctx.stroke();
        }
        for (let y = -this.V_HEIGHT; y < this.V_HEIGHT * 2; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(-this.V_WIDTH, y); ctx.lineTo(this.V_WIDTH * 2, y); ctx.stroke();
        }

        // 2. Vẽ chướng ngại vật
        for (let obs of this.obstacles) {
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
            ctx.fillStyle = obs.color;
            ctx.fill();
            ctx.strokeStyle = "#bb33ff";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // 3. Vẽ đèn pin / tầm nhìn (Flashlight Cone)
        ctx.save();
        ctx.translate(pX, pY);
        ctx.rotate(pDir);
        const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 600);
        gradient.addColorStop(0, "rgba(0, 242, 255, 0.4)");
        gradient.addColorStop(1, "rgba(0, 242, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 600, -0.6, 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 4. Vẽ Nhân Vật Chính (Glowing Dot)
        ctx.beginPath();
        ctx.arc(pX, pY, this.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff003c";
        ctx.shadowColor = "#ff003c";
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Mắt / Hướng nhân vật
        ctx.beginPath();
        ctx.arc(pX + Math.cos(pDir) * 25, pY + Math.sin(pDir) * 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#00f2ff";
        ctx.fill();

        // 5. Thanh máu (HP Bar)
        const barW = 100; const barH = 12;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(pX - barW/2, pY - 70, barW, barH);
        ctx.fillStyle = "#ff003c";
        ctx.fillRect(pX - barW/2, pY - 70, (pHP / 100) * barW, barH);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(pX - barW/2, pY - 70, barW, barH);
    }

    /** VÒNG LẶP CHO HOST (Cập nhật logic + Gửi mạng) */
    startHostLoop() {
        const loop = (now) => {
            this.updateFPS(now);
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            const p = this.player;

            // Xử lý phím di chuyển W A S D
            let dx = 0, dy = 0;
            if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
            if (this.keys['d'] || this.keys['arrowright']) dx += 1;

            if (dx !== 0 || dy !== 0) {
                const len = Math.hypot(dx, dy);
                p.vx = (dx / len) * p.speed;
                p.vy = (dy / len) * p.speed;
            } else {
                p.vx *= 0.8; p.vy *= 0.8; // Quán tính dừng
            }

            p.x += p.vx; p.y += p.vy;

            // Xoay hướng về phía chuột
            const screenCamCenterW = window.innerWidth / 2;
            const screenCamCenterH = window.innerHeight / 2;
            const mouseAngle = Math.atan2(this.mouse.y - screenCamCenterH, this.mouse.x - screenCamCenterW);
            p.dir = mouseAngle;

            // Tự động hồi máu nhẹ hoặc mất máu nếu đụng cột
            for(let obs of this.obstacles) {
                if(Math.hypot(p.x - obs.x, p.y - obs.y) < p.radius + obs.r) {
                    p.hp = Math.max(0, p.hp - 0.5);
                }
            }
            if(p.hp < 100 && Math.random() < 0.05) p.hp += 0.2;

            // Gửi dữ liệu qua mạng với tốc độ 30 FPS
            if (now - this.lastSendTime >= this.sendInterval) {
                window.Net.broadcastState({ x: p.x, y: p.y, dir: p.dir, hp: p.hp, anim: "run" });
                this.lastSendTime = now;
            }

            // Vẽ màn hình
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.applyCamera(p.x, p.y);
            this.drawWorld(p.x, p.y, p.dir, p.hp);
            this.ctx.restore(); // Restore từ applyCamera

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /** VÒNG LẶP CHO VIEWER (Nội suy + Render) */
    startSpectatorLoop() {
        let lastCamX = this.V_WIDTH / 2;
        let lastCamY = this.V_HEIGHT / 2;

        const loop = (now) => {
            this.updateFPS(now);
            
            // Lấy State nội suy từ Spectator buffer
            const state = window.Spectator.getInterpolatedState();

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (state) {
                // Di chuyển camera cực mượt (Smooth follow)
                lastCamX += (state.x - lastCamX) * 0.1;
                lastCamY += (state.y - lastCamY) * 0.1;

                this.applyCamera(lastCamX, lastCamY);
                this.drawWorld(state.x, state.y, state.dir, state.hp);
                this.ctx.restore();
            } else {
                // Đang chờ dữ liệu
                this.ctx.fillStyle = "rgba(0,0,0,0.8)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.Renderer = new GameRenderer();
