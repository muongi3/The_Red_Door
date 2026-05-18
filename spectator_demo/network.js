/**
 * network.js - Hệ thống Networking P2P (WebRTC Data Channel)
 * Chịu trách nhiệm tạo phòng, giữ kết nối và phát sóng trạng thái (Broadcast State).
 */

class NetworkManager {
    constructor() {
        this.peer = null;
        this.connections = []; // Dành cho Host: Danh sách khán giả
        this.hostConnection = null; // Dành cho Viewer: Kết nối tới Host
        this.isHost = false;
        
        // Callbacks
        this.onRoomCreated = null;
        this.onViewerJoined = null;
        this.onStateReceived = null;
        this.onPingUpdated = null;
        this.onDisconnected = null;

        this.lastPingTime = 0;
    }

    /** KHỞI TẠO HOST (NGƯỜI CHƠI) */
    initHost() {
        this.isHost = true;
        // Tạo ID ngẫu nhiên cho phòng, thêm tiền tố để tránh trùng lặp toàn cầu
        const roomId = "lostisland_host_" + Math.random().toString(36).substr(2, 6);
        
        this.peer = new Peer(roomId, {
            debug: 0 // Tắt log rác
        });

        this.peer.on('open', (id) => {
            if (this.onRoomCreated) this.onRoomCreated(id);
        });

        this.peer.on('connection', (conn) => {
            this.connections.push(conn);
            if (this.onViewerJoined) this.onViewerJoined(this.connections.length);

            conn.on('data', (data) => {
                // Phản hồi Ping để Viewer đo độ trễ
                if (data === 'ping') {
                    conn.send('pong');
                }
            });

            conn.on('close', () => {
                this.connections = this.connections.filter(c => c !== conn);
                if (this.onViewerJoined) this.onViewerJoined(this.connections.length);
            });
        });

        this.peer.on('error', (err) => {
            console.error("Host Peer Error:", err);
            if (this.onDisconnected) this.onDisconnected();
        });
    }

    /** GỬI STATE CHO KHÁN GIẢ (Dùng cho Host) */
    broadcastState(stateObj) {
        if (!this.isHost || this.connections.length === 0) return;
        
        // Gắn thêm timestamp để khán giả làm nội suy (Lerp)
        stateObj.ts = Date.now();
        const packet = JSON.stringify(stateObj);

        for (let conn of this.connections) {
            if (conn.open) {
                conn.send(packet);
            }
        }
    }

    /** KHỞI TẠO VIEWER (KHÁN GIẢ) */
    joinRoom(roomId) {
        this.isHost = false;
        this.peer = new Peer({ debug: 0 });

        this.peer.on('open', () => {
            this.hostConnection = this.peer.connect(roomId, {
                reliable: false // Dùng UDP-like DataChannel để tăng tốc độ, mất gói kệ nó
            });

            this.hostConnection.on('open', () => {
                if (this.onRoomCreated) this.onRoomCreated(roomId);
                
                // Bắt đầu vòng lặp đo Ping
                setInterval(() => {
                    if (this.hostConnection && this.hostConnection.open) {
                        this.lastPingTime = Date.now();
                        this.hostConnection.send('ping');
                    }
                }, 1000);
            });

            this.hostConnection.on('data', (data) => {
                if (data === 'pong') {
                    const ping = Date.now() - this.lastPingTime;
                    if (this.onPingUpdated) this.onPingUpdated(ping);
                    return;
                }
                
                // Nhận State Game
                try {
                    const state = JSON.parse(data);
                    if (this.onStateReceived) this.onStateReceived(state);
                } catch(e) {}
            });

            this.hostConnection.on('close', () => {
                if (this.onDisconnected) this.onDisconnected();
            });
        });

        this.peer.on('error', (err) => {
            console.error("Viewer Peer Error:", err);
            if (this.onDisconnected) this.onDisconnected();
        });
    }
}

// Global instance
window.Net = new NetworkManager();
