/**
 * app.js - Quản lý UI, Logic Chuyển Màn Hình và Event Listener
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const btnHost = document.getElementById('btn-host');
    const btnJoin = document.getElementById('btn-join');
    const inputRoom = document.getElementById('input-room-id');
    
    const hudTopLeft = document.getElementById('hud-top-left');
    const hudTopRight = document.getElementById('hud-top-right');
    const connOverlay = document.getElementById('connection-overlay');
    const connText = document.getElementById('conn-text');

    const roomIdDisplay = document.getElementById('room-id-display');
    const roleText = document.getElementById('role-text');
    const pingText = document.getElementById('ping-text');
    const viewerCountText = document.getElementById('viewer-count');

    // Tự động kiểm tra URL xem có ?room=... không
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('room');

    if (urlRoomId) {
        inputRoom.value = urlRoomId;
        startAsViewer(urlRoomId);
    }

    // Nút Host
    btnHost.addEventListener('click', () => {
        showLoading("ĐANG TẠO PHÒNG...");
        
        window.Net.onRoomCreated = (id) => {
            hideLoading();
            menuScreen.classList.add('hidden');
            hudTopLeft.classList.remove('hidden');
            hudTopRight.classList.remove('hidden');
            
            roleText.innerText = "HOSTING";
            roomIdDisplay.innerText = id;
            document.title = `Hosting - ${id}`;

            // URL để copy
            const shareUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
            history.pushState({}, '', shareUrl);

            // Bắt đầu vòng lặp game của Host
            window.Renderer.startHostLoop();
        };

        window.Net.onViewerJoined = (count) => {
            viewerCountText.innerText = count;
        };

        window.Net.initHost();
    });

    // Nút Join (Viewer)
    btnJoin.addEventListener('click', () => {
        const id = inputRoom.value.trim();
        if(!id) return alert("Vui lòng nhập ID phòng!");
        startAsViewer(id);
    });

    function startAsViewer(id) {
        showLoading("ĐANG TÌM PHÒNG...");

        window.Net.onRoomCreated = (connectedId) => {
            hideLoading();
            menuScreen.classList.add('hidden');
            hudTopLeft.classList.remove('hidden');
            hudTopRight.classList.remove('hidden');

            roleText.innerText = "SPECTATING";
            roomIdDisplay.innerText = connectedId;
            document.title = `Watching - ${connectedId}`;

            // Bắt đầu vòng lặp Spectator (nhận data và nội suy)
            window.Renderer.startSpectatorLoop();
        };

        window.Net.onPingUpdated = (ping) => {
            pingText.innerText = ping;
            pingText.style.color = ping < 100 ? "var(--glow-cyan)" : "var(--glow-red)";
        };

        window.Net.onStateReceived = (state) => {
            window.Spectator.pushState(state);
        };

        window.Net.onDisconnected = () => {
            alert("Mất kết nối với Host!");
            window.location.href = window.location.origin + window.location.pathname;
        };

        window.Net.joinRoom(id);
    }

    // UI Helpers
    function showLoading(msg) {
        connOverlay.classList.remove('hidden');
        connText.innerText = msg;
    }
    function hideLoading() {
        connOverlay.classList.add('hidden');
    }

    // Copy Link khi bấm vào ID
    roomIdDisplay.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const old = roomIdDisplay.innerText;
            roomIdDisplay.innerText = "Đã Copy!";
            setTimeout(() => roomIdDisplay.innerText = old, 1500);
        });
    });
});
