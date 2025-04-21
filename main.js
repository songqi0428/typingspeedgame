// 反应力练习游戏主逻辑

// ANSI标准87键布局（无小键盘）
const KEYBOARD_LAYOUT = [
    // 第一行：Esc F区
    [
        { label: 'Esc', type: 'func', width: 1 },
        { label: 'F1', type: 'func', width: 1 }, { label: 'F2', type: 'func', width: 1 }, { label: 'F3', type: 'func', width: 1 }, { label: 'F4', type: 'func', width: 1 },
        { label: 'F5', type: 'func', width: 1 }, { label: 'F6', type: 'func', width: 1 }, { label: 'F7', type: 'func', width: 1 }, { label: 'F8', type: 'func', width: 1 },
        { label: 'F9', type: 'func', width: 1 }, { label: 'F10', type: 'func', width: 1 }, { label: 'F11', type: 'func', width: 1 }, { label: 'F12', type: 'func', width: 1 }
    ],
    // 第二行：数字区
    [
        { label: '`', type: 'func', width: 1 },
        { label: '1', type: 'func', width: 1 }, { label: '2', type: 'func', width: 1 }, { label: '3', type: 'func', width: 1 }, { label: '4', type: 'func', width: 1 }, { label: '5', type: 'func', width: 1 }, { label: '6', type: 'func', width: 1 }, { label: '7', type: 'func', width: 1 }, { label: '8', type: 'func', width: 1 }, { label: '9', type: 'func', width: 1 }, { label: '0', type: 'func', width: 1 },
        { label: '-', type: 'func', width: 1 }, { label: '=', type: 'func', width: 1 },
        { label: 'Backspace', type: 'func', width: 2 }
    ],
    // 第三行：Tab + QWERTY
    [
        { label: 'Tab', type: 'func', width: 1.5 },
        { label: 'Q', type: 'letter', width: 1 }, { label: 'W', type: 'letter', width: 1 }, { label: 'E', type: 'letter', width: 1 }, { label: 'R', type: 'letter', width: 1 }, { label: 'T', type: 'letter', width: 1 }, { label: 'Y', type: 'letter', width: 1 }, { label: 'U', type: 'letter', width: 1 }, { label: 'I', type: 'letter', width: 1 }, { label: 'O', type: 'letter', width: 1 }, { label: 'P', type: 'letter', width: 1 },
        { label: '[', type: 'func', width: 1 }, { label: ']', type: 'func', width: 1 },
        { label: '\\', type: 'func', width: 1.5 }
    ],
    // 第四行：CapsLock + ASDF
    [
        { label: 'CapsLock', type: 'func', width: 1.8 },
        { label: 'A', type: 'letter', width: 1 }, { label: 'S', type: 'letter', width: 1 }, { label: 'D', type: 'letter', width: 1 }, { label: 'F', type: 'letter', width: 1 }, { label: 'G', type: 'letter', width: 1 }, { label: 'H', type: 'letter', width: 1 }, { label: 'J', type: 'letter', width: 1 }, { label: 'K', type: 'letter', width: 1 }, { label: 'L', type: 'letter', width: 1 },
        { label: ';', type: 'func', width: 1 }, { label: '\'', type: 'func', width: 1 },
        { label: 'Enter', type: 'func', width: 2.2 }
    ],
    // 第五行：Shift + ZXCV
    [
        { label: 'Shift', type: 'func', width: 2.2 },
        { label: 'Z', type: 'letter', width: 1 }, { label: 'X', type: 'letter', width: 1 }, { label: 'C', type: 'letter', width: 1 }, { label: 'V', type: 'letter', width: 1 }, { label: 'B', type: 'letter', width: 1 }, { label: 'N', type: 'letter', width: 1 }, { label: 'M', type: 'letter', width: 1 },
        { label: ',', type: 'func', width: 1 }, { label: '.', type: 'func', width: 1 }, { label: '/', type: 'func', width: 1 },
        { label: 'Shift', type: 'func', width: 2.8 }
    ],
    // 第六行：Ctrl/Win/Alt/Space/Alt/Menu/Ctrl
    [
        { label: 'Ctrl', type: 'func', width: 1.5 }, { label: 'Win', type: 'func', width: 1.2 }, { label: 'Alt', type: 'func', width: 1.2 },
        { label: '', type: 'func', width: 7 }, // 空格键
        { label: 'Alt', type: 'func', width: 1.2 }, { label: 'Menu', type: 'func', width: 1.2 }, { label: 'Ctrl', type: 'func', width: 1.5 }
    ]
];

const keyboardEl = document.getElementById('keyboard');
const promptBox = document.getElementById('prompt-box');
const failInfo = document.getElementById('fail-info');
const countdownEl = document.getElementById('countdown');

let activeKey = null; // 当前高亮字母
let failList = [];    // 未完成字母列表
let timer = null;     // 定时器
let isGameOver = false;
let countdownTimer = null;
let score = 0;
let highscore = parseInt(localStorage.getItem('highscore') || '0', 10);
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
scoreEl.textContent = score;
highscoreEl.textContent = highscore;

// 新增：游戏控制按钮
const container = document.querySelector('.container');
const controlBar = document.createElement('div');
controlBar.className = 'control-bar';
controlBar.innerHTML = `
    <button id="start-btn">Start</button>
    <button id="pause-btn">Pause</button>
    <button id="reset-btn">Reset</button>
`;
keyboardEl.insertAdjacentElement('afterend', controlBar);

let isPaused = false;
let hasStarted = false;

// 按钮事件
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// 调速功能
let interval = 2000; // ms，默认2秒
const speedBtn = document.getElementById('speed-btn');
const speedPopup = document.getElementById('speed-popup');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');

speedBtn.onclick = (e) => {
    speedPopup.style.display = speedPopup.style.display === 'block' ? 'none' : 'block';
};
document.addEventListener('click', (e) => {
    if (!speedPopup.contains(e.target) && e.target !== speedBtn && !speedBtn.contains(e.target)) {
        speedPopup.style.display = 'none';
    }
});
speedRange.oninput = function() {
    speedValue.textContent = parseFloat(this.value).toFixed(1);
    interval = parseFloat(this.value) * 1000;
};
speedValue.textContent = parseFloat(speedRange.value).toFixed(1);
interval = parseFloat(speedRange.value) * 1000;

// 多语言字典和setLang相关逻辑已移除
// 保留英文内容

function showCountdown(seconds, callback) {
    scrollKeyboardToCenter(); // 倒计时一出现就滚动到键盘
    let count = seconds;
    countdownEl.innerHTML = '{sec}s to start'.replace('{sec}', count);
    countdownEl.style.color = '#ff5722';
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.innerHTML = '{sec}s to start'.replace('{sec}', count);
        } else {
            clearInterval(countdownTimer);
            countdownEl.textContent = '';
            callback && callback();
        }
    }, 1000);
}

// 修改按钮事件，开始和暂停恢复时有倒计时，倒计时后滚动到键盘
startBtn.onclick = () => {
    if (!hasStarted) {
        hasStarted = true;
        isPaused = false;
        failList = [];
        activeKey = null;
        isGameOver = false;
        failInfo.textContent = '';
        score = 0;
        scoreEl.textContent = score;
        renderKeyboard();
        updatePromptBox();
        showCountdown(3, () => {
            setTimeout(() => {
                scrollKeyboardToCenter();
                nextRound();
            }, 200);
        });
    } else if (isPaused) {
        isPaused = false;
        showCountdown(3, () => {
            scrollKeyboardToCenter();
            nextRound();
        });
    }
};

pauseBtn.onclick = () => {
    if (!isGameOver && hasStarted && !isPaused) {
        isPaused = true;
        clearTimeout(timer);
    }
};

resetBtn.onclick = () => {
    isPaused = false;
    hasStarted = false;
    isGameOver = false;
    failList = [];
    activeKey = null;
    failInfo.textContent = '';
    score = 0;
    scoreEl.textContent = score;
    renderKeyboard();
    updatePromptBox();
    countdownEl.textContent = '';
    clearInterval(countdownTimer);
};

// 获取所有字母键
function getAllLetterKeys() {
    return KEYBOARD_LAYOUT.flat().filter(k => k.type === 'letter').map(k => k.label);
}

// 渲染键盘
function renderKeyboard(active = null) {
    keyboardEl.innerHTML = '';
    KEYBOARD_LAYOUT.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        row.forEach(key => {
            const keyEl = document.createElement('div');
            keyEl.className = 'key';
            keyEl.style.flex = key.width || 1;
            // 字母键
            if (key.type === 'letter') {
                if (active === key.label) {
                    keyEl.classList.add('active', 'show-label');
                    keyEl.textContent = key.label;
                } else {
                    keyEl.classList.add('inactive');
                    keyEl.textContent = '';
                }
                keyEl.dataset.key = key.label;
                keyEl.onclick = () => handleInput(key.label);
            } else {
                // 功能键：不显示内容
                keyEl.classList.add('func-key');
                keyEl.textContent = '';
                keyEl.onclick = null;
            }
            rowEl.appendChild(keyEl);
        });
        keyboardEl.appendChild(rowEl);
    });
}

// 随机选择一个字母
function getRandomKey() {
    const allKeys = getAllLetterKeys();
    return allKeys[Math.floor(Math.random() * allKeys.length)];
}

// 显示提示框内容
function updatePromptBox() {
    promptBox.textContent = failList.join(' ') + (activeKey ? ' ' + activeKey : '');
}

// 处理输入
function handleInput(inputKey) {
    if (isGameOver || !activeKey || isPaused || !hasStarted) return;
    if (inputKey === activeKey) {
        score++;
        scoreEl.textContent = score;
        activeKey = null;
        renderKeyboard();
        updatePromptBox();
        clearTimeout(timer);
        setTimeout(nextRound, 200);
    }
}

// 支持空格键暂停/恢复，恢复时有倒计时
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!hasStarted && !isGameOver) {
            startBtn.onclick();
            return;
        }
        if (!hasStarted || isGameOver) return;
        if (!isPaused) {
            isPaused = true;
            clearTimeout(timer);
        } else {
            isPaused = false;
            showCountdown(3, () => nextRound());
        }
        return;
    }
    if (isGameOver || isPaused || !hasStarted) return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleInput(key);
    }
});

// 进入下一轮
function nextRound() {
    if (isGameOver || isPaused || !hasStarted) return;
    activeKey = getRandomKey();
    renderKeyboard(activeKey);
    updatePromptBox();
    timer = setTimeout(() => {
        // 未及时输入，累积到failList
        failList.push(activeKey);
        if (failList.length >= 10) {
            gameOver();
        } else {
            activeKey = null;
            renderKeyboard();
            updatePromptBox();
            setTimeout(nextRound, 200);
        }
    }, interval);
}

// 游戏失败
function gameOver() {
    isGameOver = true;
    failInfo.textContent = 'Game Over! 10 missed letters. Click Reset to restart.';
    promptBox.textContent = failList.join(' ');
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        highscoreEl.textContent = highscore;
    }
}

function scrollKeyboardToCenter() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    const rect = keyboard.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const keyboardCenter = rect.top + scrollTop + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    window.scrollTo({
        top: Math.max(0, keyboardCenter - viewportCenter),
        behavior: 'smooth'
    });
}

// 初始化只渲染键盘和提示框，不自动开始
renderKeyboard();
updatePromptBox();
countdownEl.textContent = '';

// 侧边栏菜单逻辑
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarMask = document.getElementById('sidebar-mask');
const sidebarBacktop = document.getElementById('sidebar-backtop');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarMask.classList.add('active');
}
function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarMask.classList.remove('active');
}
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('active')) {
        closeSidebar();
    } else {
        openSidebar();
    }
});
sidebarMask.addEventListener('click', closeSidebar);
// ESC键关闭菜单
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
});
// 返回顶部
sidebarBacktop.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeSidebar();
});

// 侧边栏菜单项点击后自动关闭菜单并平滑滚动到对应区块
const sidebarLinks = document.querySelectorAll('.sidebar-list a[href^="#"]');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').replace('#', '');
        if (targetId) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                closeSidebar();
                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 180);
            }
        }
    });
});

// 返回顶部按钮逻辑
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 180) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}); 