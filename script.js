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

// Загрузка сохранения
function loadSave() {
    const saved = localStorage.getItem('currencyTradingSave');
    if (saved) {
        const data = JSON.parse(saved);
        balances = data.balances || balances;
        rates = data.rates || rates;
    }
}

// Сохранение
function saveGame() {
    localStorage.setItem('currencyTradingSave', JSON.stringify({ balances, rates }));
}

// Новости
const positiveNews = [
    "Экономика ЕС растёт быстрее ожиданий!", "ЕЦБ снижает ставки", "Сильные данные по экспорту ЕС",
    "Китай объявил о стимулах", "Рост ВВП Китая превысил прогноз", "Стабилизация юаня",
    "Торговое соглашение США-ЕС", "Рекордные инвестиции в еврозону", "Снижение инфляции в Китае",
    "Бум экспорта из Китая", "Положительные данные по занятости в ЕС", "Стабильность юаня"
];

const negativeNews = [
    "Рецессия в еврозоне", "ЕЦБ повышает ставки", "Слабые данные по ВВП ЕС",
    "Замедление экономики Китая", "Давление на юань", "Торговые ограничения для Китая",
    "Инфляция в ЕС вышла из-под контроля", "Отток капитала из Китая", "Политическая нестабильность в ЕС",
    "Снижение экспорта Китая", "Кризис на рынке недвижимости Китая", "Геополитическая напряжённость"
];

// Специфичные новости
const eurPositive = ["Еврозона показывает рост", "Евро укрепляется", "Приток инвестиций в ЕС", "Снижение ставок ЕЦБ"];
const eurNegative = ["Кризис в еврозоне", "Евро слабеет", "Отток капитала из ЕС", "Повышение ставок ЕЦБ"];
const cnyPositive = ["Юань укрепляется", "Китай стимулирует экономику", "Рост экспорта КНР", "Стабильность в Китае"];
const cnyNegative = ["Юань под давлением", "Замедление в Китае", "Ограничения на экспорт", "Кризис недвижимости КНР"];

// Обновление отображения
function updateDisplay() {
    document.getElementById('usd-balance').textContent = balances.USD.toFixed(2);
    document.getElementById('eur-rate').textContent = rates.EUR.toFixed(1);
    document.getElementById('cny-rate').textContent = rates.CNY.toFixed(1);
    document.getElementById('eur-balance').textContent = balances.EUR.toFixed(2);
    document.getElementById('cny-balance').textContent = balances.CNY.toFixed(2);
    document.getElementById('total-usd').textContent = `${balances.USD.toFixed(2)} USD`;

    document.getElementById('modal-usd').textContent = balances.USD.toFixed(2);
    document.getElementById('modal-eur').textContent = balances.EUR.toFixed(2);
    document.getElementById('modal-cny').textContent = balances.CNY.toFixed(2);

    updateHint('EUR');
    updateHint('CNY');
}

// Обновление подсказки
function updateHint(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const hint = document.getElementById(`${currency.toLowerCase()}-hint`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        hint.textContent = '';
        return;
    }

    let buyText, sellText;
    if (currency === 'EUR') {
        const buyEur = (amount / rates.EUR).toFixed(2);
        const sellEur = (amount / rates.EUR).toFixed(2);
        buyText = `Купите ${buyEur} EUR`;
        sellText = `Продайте ${sellEur} EUR`;
    } else if (currency === 'CNY') {
        const buyCny = (amount / rates.CNY).toFixed(2);
        const sellCny = (amount / rates.CNY).toFixed(2);
        buyText = `Купите ${buyCny} CNY`;
        sellText = `Продайте ${sellCny} CNY`;
    }

    hint.textContent = `${buyText} | ${sellText}`;
}

// Показ уведомления на 4 секунды
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

// Случайные флуктуации (постоянно, каждые 5 сек)
function fluctuateRates() {
    const noiseEUR = Math.random() * 0.8 - 0.2; // Чаще рост
    const noiseCNY = Math.random() * 8.0 - 2.0; // Чаще рост

    rates.EUR += noiseEUR;
    rates.CNY += noiseCNY;

    rates.EUR = Math.max(0.1, rates.EUR);
    rates.CNY = Math.max(1.0, rates.CNY);

    updateDisplay();
    saveGame();
}

// Новости (раз в 50 сек)
function newsImpact() {
    const rand = Math.random();
    let news, affectEUR = 0, affectCNY = 0, isPositive = true;

    if (rand < 0.6) { // Чаще положительные
        news = positiveNews[Math.floor(Math.random() * positiveNews.length)];
        affectEUR = Math.random() * 2.0 + 0.5;
        affectCNY = Math.random() * 20.0 + 5.0;
    } else {
        news = negativeNews[Math.floor(Math.random() * negativeNews.length)];
        affectEUR = - (Math.random() * 1.0 + 0.5);
        affectCNY = - (Math.random() * 10.0 + 2.0);
        isPositive = false;
    }

    rates.EUR += affectEUR;
    rates.CNY += affectCNY;

    rates.EUR = Math.max(0.1, rates.EUR);
    rates.CNY = Math.max(1.0, rates.CNY);

    showToast(news, isPositive);
    updateDisplay();
    saveGame();
}

// Покупка
function buy(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0 || amount > balances.USD) {
        showToast("Недостаточно USD или неверная сумма", false);
        return;
    }

    if (currency === 'EUR') {
        balances.EUR += amount / rates.EUR;
        balances.USD -= amount;
    } else if (currency === 'CNY') {
        balances.CNY += amount / rates.CNY;
        balances.USD -= amount;
    }

    amountInput.value = '';
    updateDisplay();
    saveGame();
    showToast(`Куплено ${currency} на ${amount.toFixed(2)} USD`);
}

// Продажа
function sell(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Введите корректную сумму", false);
        return;
    }

    let toSell;
    if (currency === 'EUR') {
        toSell = amount / rates.EUR;
        if (toSell > balances.EUR) {
            showToast("Недостаточно EUR", false);
            return;
        }
        balances.EUR -= toSell;
        balances.USD += amount;
    } else if (currency === 'CNY') {
        toSell = amount / rates.CNY;
        if (toSell > balances.CNY) {
            showToast("Недостаточно CNY", false);
            return;
        }
        balances.CNY -= toSell;
        balances.USD += amount;
    }

    amountInput.value = '';
    updateDisplay();
    saveGame();
    showToast(`Продано ${currency} за ${amount.toFixed(2)} USD`);
}

// Продать все
function sellAll(currency) {
    if (balances[currency] <= 0) {
        showToast(`Нет ${currency} для продажи`, false);
        return;
    }

    let usdGain = balances[currency] * rates[currency];

    balances.USD += usdGain;
    balances[currency] = 0;

    updateDisplay();
    saveGame();
    showToast(`Продана вся ${currency} за ${usdGain.toFixed(2)} USD`);
}

// Модальное окно активов
function toggleAssets() {
    const modal = document.getElementById('assets-modal');
    modal.classList.toggle('hidden');
    updateDisplay();
}

// Инициализация
loadSave();
updateDisplay();

// Постоянные флуктуации каждые 5 сек
setInterval(fluctuateRates, 5000);

// Новости каждые 50 сек
setInterval(newsImpact, 50000);

// Первая флуктуация и новость
setTimeout(fluctuateRates, 3000);
setTimeout(newsImpact, 5000);
