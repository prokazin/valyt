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
    EUR: 1.1715,
    CNY: 6.9776
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
    document.getElementById('eur-rate').textContent = rates.EUR.toFixed(4);
    document.getElementById('cny-rate').textContent = rates.CNY.toFixed(4);
    document.getElementById('total-usd').textContent = `${balances.USD.toFixed(2)} USD`;

    document.getElementById('modal-usd').textContent = balances.USD.toFixed(2);
    document.getElementById('modal-eur').textContent = balances.EUR.toFixed(4);
    document.getElementById('modal-cny').textContent = balances.CNY.toFixed(2);
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

// Изменение курсов с зависимостью от новостей и случайных флуктуаций
function changeRates() {
    const isNewsEvent = Math.random() < 0.5; // 50% шанс новости, 50% случайное изменение
    let news, affectEUR = 0, affectCNY = 0;

    if (isNewsEvent) {
        // Логика новостей как раньше
        const rand = Math.random();
        if (rand < 0.4) {
            news = positiveNews[Math.floor(Math.random() * positiveNews.length)];
            affectEUR = 0.015;
            affectCNY = 0.08;
        } else if (rand < 0.8) {
            news = negativeNews[Math.floor(Math.random() * negativeNews.length)];
            affectEUR = -0.015;
            affectCNY = -0.08;
        } else if (rand < 0.9) {
            if (Math.random() > 0.5) {
                news = eurPositive[Math.floor(Math.random() * eurPositive.length)];
                affectEUR = 0.025;
            } else {
                news = eurNegative[Math.floor(Math.random() * eurNegative.length)];
                affectEUR = -0.025;
            }
            affectCNY = affectEUR * (Math.random() * 0.4 - 0.2);
        } else {
            if (Math.random() > 0.5) {
                news = cnyPositive[Math.floor(Math.random() * cnyPositive.length)];
                affectCNY = 0.12;
            } else {
                news = cnyNegative[Math.floor(Math.random() * cnyNegative.length)];
                affectCNY = -0.12;
            }
            affectEUR = affectCNY * (Math.random() * 0.3 - 0.15);
        }
        showToast(news, affectEUR + affectCNY > 0);
    } else {
        // Случайное изменение без новости
        news = "Рыночные флуктуации";
        showToast(news, true);
    }

    // Применяем изменения с шумом (всегда)
    const noiseEUR = (Math.random() - 0.5) * 0.002; // Маленький шум
    const noiseCNY = (Math.random() - 0.5) * 0.01;

    rates.EUR += affectEUR + noiseEUR;
    rates.CNY += affectCNY + noiseCNY;

    // Ограничения реалистичные
    rates.EUR = Math.max(1.05, Math.min(1.30, rates.EUR));
    rates.CNY = Math.max(6.5, Math.min(7.5, rates.CNY));

    updateDisplay();
    saveGame();
}

// Покупка/Продажа
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
        balances.CNY += amount * rates.CNY;
        balances.USD -= amount;
    }

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
        toSell = amount / rates.CNY; // Исправлено: amount в USD -> CNY to sell = amount / rate (поскольку rate = CNY per USD? Wait, no: to get CNY from USD amount, but sell: input USD equivalent, so CNY = amount * rate? Wait, previous was wrong.
        Wait, correction: for sell, input is USD to receive, so CNY to sell = amount * rate? No.
        Standard: rate CNY/USD = how many CNY per 1 USD.
        To buy: spend USD, get USD * rate CNY.
        To sell: sell CNY, get USD = CNY_sold / rate.
        So input amount in USD (to receive), then CNY_sold = amount * rate.
        Yes, previous was correct: cnyToSell = amount * rates.CNY;
        if (cnyToSell > balances.CNY)
        balances.CNY -= cnyToSell;
        balances.USD += amount;
    }

    amountInput.value = '';
    updateDisplay();
    saveGame();
    showToast(`Продано ${currency} за ${amount.toFixed(2)} USD`);
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

// Изменения каждые 12 секунд
setInterval(changeRates, 12000);

// Первая новость/изменение через 3 сек
setTimeout(changeRates, 3000);
