// 定义WebSocket的URL
const wsUrl = "wss://api.1900.live/actives_ws";
const cdn = "https://cdn.1900.live/apps/";
const appUrl = "https://1900.live/assets/app.json";

let app = {};
// {
//     wechat: {
//         title: "微信",
//         url: "wechat.png",
//         action: "摸鱼",
//     },
//     chrome: {
//         title: "Chrome",
//         url: "chrome.png",
//         action: "冲浪",
//     },
//     code: {
//         title: "VSCODE",
//         url: "code.png",
//         action: "编码",
//     },
//     "lx-music-desktop.exe": {
//         title: "洛雪音乐播放器",
//         url: "music.png",
//         action: "听音乐",
//     },
//     tim: {
//         title: "TIM",
//         url: "qq.png",
//         action: "摸鱼",
//     },
//     hydee: {
//         title: "工作ERP",
//         url: "hydee.jpg",
//         action: "工作",
//     },
//     wxwork: {
//         title: "企业微信",
//         url: "wxwork.png",
//         action: "工作",
//     },
//     obsidian: {
//         title: "Obsidian",
//         url: "obsidian.png",
//         action: "做笔记",
//     },
//     windowsterminal: {
//         title: "WindowsTerminal",
//         url: "windowsterminal.png",
//         action: "",
//     },
// };

// 保存WebSocket实例的变量
let ws2;
let counter = 0;

// 初始化WebSocket连接
export default function initWebSocket() {
    ws2 = new WebSocket(wsUrl);

    updateAppList();
    // 绑定事件处理函数
    ws2.onopen = onOpen;
    ws2.onmessage = onMessage;
    ws2.onclose = onClose;
    ws2.onerror = onError;
}

function updateAppList(){
    fetch(appUrl).then((rep) => {
        rep.json().then((data) => {
            // 绑定事件处理函数
            app = data;
        });
    });
}

// 连接成功的处理函数
function onOpen(event) {
    console.log("WebSocket connection opened:", event);
    // 可以在这里发送消息等操作
}

// 接收到消息的处理函数
function onMessage(event) {
    //console.log("WebSocket message received:", event.data);
    var data = JSON.parse(event.data);
    var activs = document.querySelector(".actives");
    const processName = data.process.toLowerCase();

    // 处理接收到的消息
    if (activs.dataset.app != data.process && processName in app) {
        fetch(cdn + app[processName].url + "!20w").then(
            function () {
                activs.style.display = "block";
                activs.classList.add("exit");
                setTimeout(function name(params) {
                    document.querySelector(".actives img").src =
                        cdn + app[processName].url + "!20w";
                    activs.classList.remove("exit");
                    activs.dataset.app = processName;
                    activeTippy.forEach(function (e) {
                        e.setContent(
                            "@1900 在使用 " +
                                app[processName].title +
                                " " +
                                app[processName].action
                        );
                    });
                    counter = 0;
                }, 500);
            }
        );
    } else if (!(processName in app)) {
        activs.classList.add("exit");
    }
    //console.log("5未匹配次数：" + counter);
}

// 连接关闭的处理函数
function onClose(event) {
    // 尝试重新连接
    document.querySelector(".actives").classList.add("exit");
    setTimeout(initWebSocket, 5000); // 5秒后尝试重新连接
}

// 连接错误的处理函数
function onError(event) {
    // 尝试重新连接
    document.querySelector(".actives").classList.add("exit");
}
