// script.js
Telegram.WebApp.ready();
Telegram.WebApp.expand();

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

// Загрузка/сохранение
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

// Новости
const positiveNews = [
    "Экономика ЕС растёт быстрее ожиданий!", "ЕЦБ снижает ставки", "Сильные данные по экспорту ЕС",
    "Китай объявил о стимулах", "Рост ВВП Китая превысил прогноз", "Стабилизация юаня"
];

const negativeNews = [
    "Рецессия в еврозоне", "ЕЦБ повышает ставки", "Слабые данные по ВВП ЕС",
    "Замедление экономики Китая", "Давление на юань", "Торговые ограничения для Китая"
];

// Обновление отображения
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
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const hint = document.getElementById(`${currency.toLowerCase()}-hint`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        hint.textContent = '';
        return;
    }

    let qty;
    if (currency === 'EUR') {
        qty = (amount / rates.EUR).toFixed(2);
    } else if (currency === 'CNY') {
        qty = (amount / rates.CNY).toFixed(2);
    }

    hint.textContent = `Купите ${qty} ${currency} | Продайте ${qty} ${currency}`;
}

// Toast
function showToast(message, isPositive = true) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isPositive ? 'rgba(0, 150, 0, 0.9)' : 'rgba(200, 0, 0, 0.9)';
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// Сбалансированные сильные колебания (рост и падение равновероятны)
function fluctuateRates() {
    // EUR: симметричные изменения ±0.05–0.25
    const changeEUR = (Math.random() - 0.5) * 0.4;
    rates.EUR += changeEUR;

    // CNY: симметричные изменения ±1.0–5.0
    const changeCNY = (Math.random() - 0.5) * 8.0;
    rates.CNY += changeCNY;

    rates.EUR = Math.max(0.5, rates.EUR);
    rates.CNY = Math.max(3.0, rates.CNY);

    updateDisplay();
    saveGame();
}

// Новости: 50/50 положительные/отрицательные с сильным влиянием
function newsImpact() {
    const isPositive = Math.random() < 0.5;
    const newsArray = isPositive ? positiveNews : negativeNews;
    const news = newsArray[Math.floor(Math.random() * newsArray.length)];

    const affectEUR = isPositive ? (Math.random() * 0.6 + 0.2) : -(Math.random() * 0.6 + 0.2);
    const affectCNY = isPositive ? (Math.random() * 12.0 + 4.0) : -(Math.random() * 12.0 + 4.0);

    rates.EUR += affectEUR;
    rates.CNY += affectCNY;

    rates.EUR = Math.max(0.5, rates.EUR);
    rates.CNY = Math.max(3.0, rates.CNY);

    showToast(news, isPositive);
    updateDisplay();
    saveGame();
}

// Покупка/продажа/продажа всего
function buy(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0 || amount > balances.USD) {
        showToast("Недостаточно USD или неверная сумма", false);
        return;
    }

    if (currency === 'EUR') {
        balances.EUR += amount / rates.EUR;
    } else if (currency === 'CNY') {
        balances.CNY += amount / rates.CNY;
    }
    balances.USD -= amount;

    amountInput.value = '';
    updateDisplay();
    saveGame();
    showToast(`Куплено ${currency} на ${amount.toFixed(2)} USD`);
}

function sell(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Введите корректную сумму", false);
        return;
    }

    const toSell = amount / rates[currency];
    if (toSell > balances[currency]) {
        showToast(`Недостаточно ${currency}`, false);
        return;
    }

    balances[currency] -= toSell;
    balances.USD += amount;

    amountInput.value = '';
    updateDisplay();
    saveGame();
    showToast(`Продано ${currency} за ${amount.toFixed(2)} USD`);
}

function sellAll(currency) {
    if (balances[currency] <= 0) {
        showToast(`Нет ${currency} для продажи`, false);
        return;
    }

    const usdGain = balances[currency] * rates[currency];
    balances.USD += usdGain;
    balances[currency] = 0;

    updateDisplay();
    saveGame();
    showToast(`Продана вся ${currency} за ${usdGain.toFixed(2)} USD`);
}

// Модальные окна
function toggleAssets() {
    document.getElementById('assets-modal').classList.toggle('hidden');
    updateDisplay();
}

function showProfit() {
    document.getElementById('profit-modal').classList.toggle('hidden');
}

// Инициализация
loadSave();
updateDisplay();

// Колебания каждые 5 сек, новости каждые 50 сек
setInterval(fluctuateRates, 5000);
setInterval(newsImpact, 50000);

setTimeout(fluctuateRates, 3000);
setTimeout(newsImpact, 5000);