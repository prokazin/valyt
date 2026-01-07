// script.js
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Конфиг Supabase
const SUPABASE_URL = 'https://usokyVoBYkVQpiHiM8DPWQ.supabase.co'; // из твоего ключа
const SUPABASE_ANON_KEY = 'sb_publishable_usokyVoBYkVQpiHiM8DPWQ_fHLItYKD';

// Данные пользователя
const user = Telegram.WebApp.initDataUnsafe.user || null;
const userId = user ? user.id : null;
const username = user ? (user.username || user.first_name || 'Игрок') : 'Аноним';

// Состояние игры
let balances = {
    USD: 100.00,
    EUR: 0.00,
    CNY: 0.00
};

let rates = {
    EUR: 1.2,
    CNY: 7.1
};

// Загрузка/сохранение локально
function loadSave() {
    const saved = localStorage.getItem('currencyTradingSave');
    if (saved) {
        const data = JSON.parse(saved);
        balances = data.balances || balances;
        rates = data.rates || rates;
    }
}

function saveGame() {
    localStorage.setItem('currencyTradingSave', JSON.stringify({ balances, rates }));
}

// Отправка баланса в рейтинг
async function updateLeaderboard() {
    if (!userId) return; // Только авторизованные пользователи

    try {
        // Используем upsert — обновит, если запись есть
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                user_id: userId,
                username: username,
                balance: balances.USD
            })
        });

        if (!response.ok) {
            console.error('Ошибка отправки в рейтинг');
        }
    } catch (err) {
        console.error('Сеть:', err);
    }
}

// Загрузка топ-10
async function loadLeaderboard() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?order=balance.desc&limit=10`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayLeaderboard(data);
        }
    } catch (err) {
        console.error('Ошибка загрузки рейтинга');
    }
}

// Отображение рейтинга в окне 📈
function displayLeaderboard(players) {
    let html = '<h2>🏆 Топ-10 игроков</h2><ol style="text-align:left;margin:0 auto;max-width:260px;">';
    players.forEach((p, i) => {
        const name = p.username || 'Игрок';
        const highlight = p.user_id === userId ? ' style="color:#007aff;font-weight:bold;"' : '';
        html += `<li${highlight}>${i+1}. ${name} — ${parseFloat(p.balance).toFixed(2)} USD</li>`;
    });
    html += '</ol>';
    html += '<button onclick="showProfit()" class="close-btn">Закрыть</button>';

    document.querySelector('#profit-modal .modal-content').innerHTML = html;
}

// Обновление UI
function updateDisplay() {
    document.getElementById('usd-balance').textContent = balances.USD.toFixed(2);
    document.getElementById('eur-rate').textContent = rates.EUR.toFixed(1);
    document.getElementById('cny-rate').textContent = rates.CNY.toFixed(1);
    document.getElementById('eur-balance').textContent = balances.EUR.toFixed(2);
    document.getElementById('cny-balance').textContent = balances.CNY.toFixed(2);

    document.getElementById('modal-usd').textContent = balances.USD.toFixed(2);
    document.getElementById('modal-eur').textContent = balances.EUR.toFixed(2);
    document.getElementById('modal-cny').textContent = balances.CNY.toFixed(2);

    updateHint('EUR');
    updateHint('CNY');
}

// Подсказки
function updateHint(currency) {
    const input = document.getElementById(`${currency.toLowerCase()}-amount`);
    const hint = document.getElementById(`${currency.toLowerCase()}-hint`);
    const amount = parseFloat(input.value);
    if (isNaN(amount) || amount <= 0) {
        hint.textContent = '';
        return;
    }
    const qty = (amount / rates[currency]).toFixed(2);
    hint.textContent = `Купите ${qty} ${currency} | Продайте ${qty} ${currency}`;
}

// Toast
function showToast(msg, positive = true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.backgroundColor = positive ? 'rgba(0,150,0,0.9)' : 'rgba(200,0,0,0.9)';
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// Волатильность (сбалансированная)
function fluctuateRates() {
    rates.EUR += (Math.random() - 0.5) * 0.4;
    rates.CNY += (Math.random() - 0.5) * 8.0;
    rates.EUR = Math.max(0.5, rates.EUR);
    rates.CNY = Math.max(3.0, rates.CNY);
    updateDisplay();
    saveGame();
    updateLeaderboard();
}

function newsImpact() {
    const positive = Math.random() < 0.5;
    const newsArr = positive ? positiveNews : negativeNews;
    const news = newsArr[Math.floor(Math.random() * newsArr.length)];
    const effEUR = positive ? (Math.random() * 0.6 + 0.2) : -(Math.random() * 0.6 + 0.2);
    const effCNY = positive ? (Math.random() * 12 + 4) : -(Math.random() * 12 + 4);
    rates.EUR += effEUR;
    rates.CNY += effCNY;
    rates.EUR = Math.max(0.5, rates.EUR);
    rates.CNY = Math.max(3.0, rates.CNY);
    showToast(news, positive);
    updateDisplay();
    saveGame();
    updateLeaderboard();
}

// Торговля
function buy(cur) {
    const amt = parseFloat(document.getElementById(`${cur.toLowerCase()}-amount`).value);
    if (isNaN(amt) || amt <= 0 || amt > balances.USD) return showToast("Ошибка суммы", false);
    if (cur === 'EUR') balances.EUR += amt / rates.EUR;
    else balances.CNY += amt / rates.CNY;
    balances.USD -= amt;
    document.getElementById(`${cur.toLowerCase()}-amount`).value = '';
    updateDisplay();
    saveGame();
    updateLeaderboard();
    showToast(`Куплено ${cur}`);
}

function sell(cur) {
    const amt = parseFloat(document.getElementById(`${cur.toLowerCase()}-amount`).value);
    if (isNaN(amt) || amt <= 0) return showToast("Ошибка суммы", false);
    const toSell = amt / rates[cur];
    if (toSell > balances[cur]) return showToast(`Недостаточно ${cur}`, false);
    balances[cur] -= toSell;
    balances.USD += amt;
    document.getElementById(`${cur.toLowerCase()}-amount`).value = '';
    updateDisplay();
    saveGame();
    updateLeaderboard();
    showToast(`Продано ${cur}`);
}

function sellAll(cur) {
    if (balances[cur] <= 0) return showToast(`Нет ${cur}`, false);
    balances.USD += balances[cur] * rates[cur];
    balances[cur] = 0;
    updateDisplay();
    saveGame();
    updateLeaderboard();
    showToast(`Всё продано`);
}

// Модалки
function toggleAssets() {
    document.getElementById('assets-modal').classList.toggle('hidden');
    updateDisplay();
}

function showProfit() {
    loadLeaderboard();
    document.getElementById('profit-modal').classList.toggle('hidden');
}

// Инициализация
loadSave();
updateDisplay();
updateLeaderboard(); // Отправить начальный баланс

setInterval(fluctuateRates, 5000);
setInterval(newsImpact, 50000);
setTimeout(fluctuateRates, 3000);
setTimeout(newsImpact, 5000);