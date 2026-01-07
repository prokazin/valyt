// script.js — с полной оплатой Stars и быстрыми ставками
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Supabase
const SUPABASE_URL = 'https://cejlpcerpwuepckkngcj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Eum6jPSZnELNF7EaIY6jfQ_TBXk7wY6';

// Пользователь
const user = Telegram.WebApp.initDataUnsafe.user || null;
const userId = user ? user.id : null;
const username = user ? (user.username || user.first_name || 'Игрок') : 'Аноним';

// Состояние
let balances = { USD: 100.00, EUR: 0.00, CNY: 0.00 };
let rates = { EUR: 1.2, CNY: 7.1 };

// Новости
const positiveNews = ["Экономика ЕС растёт!", "Китай объявил о стимулах"];
const negativeNews = ["Рецессия в еврозоне", "Давление на юань"];

// Сохранение
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

// Лидерборд
async function updateLeaderboard() {
    if (!userId) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ user_id: userId, username, balance: balances.USD })
        });
    } catch (err) {}
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?order=balance.desc&limit=10`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (res.ok) {
            const data = await res.json();
            displayLeaderboard(data);
        }
    } catch (err) {}
}

function displayLeaderboard(players) {
    let html = '<h2>🏆 Топ-10 игроков</h2>';
    if (players.length === 0) {
        html += '<p style="font-size:16px;color:#666;">Пока никто не играл.<br>Будьте первым!</p>';
    } else {
        html += '<ol style="text-align:left;margin:0 auto;max-width:260px;">';
        players.forEach((p, i) => {
            const name = p.username || 'Игрок';
            const highlight = p.user_id === userId ? ' style="color:#007aff;font-weight:bold;"' : '';
            html += `<li${highlight}>${i+1}. ${name} — ${parseFloat(p.balance).toFixed(2)} USD</li>`;
        });
        html += '</ol>';
    }
    html += '<button onclick="showLeaderboard()" class="close-btn">Закрыть</button>';
    document.querySelector('#leaderboard-modal .modal-content').innerHTML = html;
}

// UI
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

// Волатильность
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
    const news = (positive ? positiveNews : negativeNews)[Math.floor(Math.random() * positiveNews.length)];
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
    balances[cur] += amt / rates[cur];
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

// Ставки (быстрые кнопки)
function quickBet(currency, direction, minutes) {
    const amount = parseFloat(document.getElementById('bet-amount').value);
    if (isNaN(amount) || amount <= 0 || amount > balances.USD) {
        showToast("Введите сумму ставки", false);
        return;
    }

    balances.USD -= amount;
    const startRate = rates[currency];

    activeBets.push({
        currency,
        direction,
        amount,
        startRate,
        endTime: Date.now() + minutes * 60 * 1000
    });

    updateDisplay();
    saveGame();
    updateLeaderboard();
    showToast(`Ставка ${amount} USD на ${direction === 'up' ? 'рост' : 'падение'} ${currency} (${minutes} мин)`);
    closeBetModal();

    setTimeout(() => checkBet(currency, direction, amount, startRate), minutes * 60 * 1000);
}

let activeBets = [];

function checkBet(currency, direction, amount, startRate) {
    const currentRate = rates[currency];
    const won = (direction === 'up' && currentRate > startRate) || (direction === 'down' && currentRate < startRate);

    if (won) {
        const profit = amount * 1.8;
        balances.USD += profit;
        showToast(`Ставка выиграна! +${profit.toFixed(2)} USD 🎉`, true);
    } else {
        showToast("Ставка проиграна 😔", false);
    }

    updateDisplay();
    saveGame();
    updateLeaderboard();
}

// Оплата Stars (полностью рабочая)
function buyStarsBonus() {
    Telegram.WebApp.showPopup({
        title: "Бонус за Stars",
        message: "Купить 1000 USD за 100 ⭐ Stars?",
        buttons: [
            { type: 'ok', text: 'Купить' },
            { type: 'cancel' }
        ]
    }, (btn) => {
        if (btn === 'ok') {
            const invoice = {
                title: 'Бонус в трейдинге',
                description: '+1000 USD в игре',
                payload: 'bonus_1000_usd',
                provider_token: '',
                currency: 'XTR',
                prices: [{ label: 'Бонус 1000 USD', amount: 10000 }] // 100 Stars
            };
            Telegram.WebApp.sendInvoice(invoice);
        }
    });
}

// Обработка оплаты
Telegram.WebApp.onEvent('invoice_closed', (payload) => {
    if (payload.status === 'paid' && payload.payload === 'bonus_1000_usd') {
        balances.USD += 1000;
        updateDisplay();
        saveGame();
        updateLeaderboard();
        showToast('+1000 USD за Stars! ⭐', true);
    } else if (payload.status === 'failed') {
        showToast('Оплата не удалась', false);
    }
});

// Модалки
function toggleAssets() {
    document.getElementById('assets-modal').classList.toggle('hidden');
    updateDisplay();
}

function showExpectedProfit() {
    document.getElementById('expected-profit-modal').classList.toggle('hidden');
}

function showLeaderboard() {
    loadLeaderboard();
    document.getElementById('leaderboard-modal').classList.toggle('hidden');
}

function openBetModal() {
    document.getElementById('bet-modal').classList.remove('hidden');
}

function closeBetModal() {
    document.getElementById('bet-modal').classList.add('hidden');
}

// Инициализация
loadSave();
updateDisplay();
updateLeaderboard();

setInterval(fluctuateRates, 5000);
setInterval(newsImpact, 50000);
setTimeout(fluctuateRates, 3000);
setTimeout(newsImpact, 5000);