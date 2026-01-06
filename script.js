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
    EUR: 1.1000,
    CNY: 7.0000
};

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

// Изменение курсов с зависимостью от новостей
function changeRates() {
    // Выбираем тип новости
    const rand = Math.random();
    let news, affectEUR = 0, affectCNY = 0;

    if (rand < 0.4) {
        // Общая положительная
        news = positiveNews[Math.floor(Math.random() * positiveNews.length)];
        affectEUR = 0.015;
        affectCNY = 0.08;
    } else if (rand < 0.8) {
        // Общая отрицательная
        news = negativeNews[Math.floor(Math.random() * negativeNews.length)];
        affectEUR = -0.015;
        affectCNY = -0.08;
    } else if (rand < 0.9) {
        // Специально для EUR
        if (Math.random() > 0.5) {
            news = eurPositive[Math.floor(Math.random() * eurPositive.length)];
            affectEUR = 0.025;
        } else {
            news = eurNegative[Math.floor(Math.random() * eurNegative.length)];
            affectEUR = -0.025;
        }
        affectCNY = affectEUR * (Math.random() * 0.4 - 0.2); // слабая корреляция
    } else {
        // Специально для CNY
        if (Math.random() > 0.5) {
            news = cnyPositive[Math.floor(Math.random() * cnyPositive.length)];
            affectCNY = 0.12;
        } else {
            news = cnyNegative[Math.floor(Math.random() * cnyNegative.length)];
            affectCNY = -0.12;
        }
        affectEUR = affectCNY * (Math.random() * 0.3 - 0.15);
    }

    // Применяем изменения с небольшим шумом
    const noiseEUR = Math.random() * 0.01 - 0.005;
    const noiseCNY = Math.random() * 0.05 - 0.025;

    rates.EUR += affectEUR + noiseEUR;
    rates.CNY += affectCNY + noiseCNY;

    // Ограничения
    rates.EUR = Math.max(0.90, Math.min(1.30, rates.EUR));
    rates.CNY = Math.max(6.0, Math.min(8.0, rates.CNY));

    showToast(news, affectEUR + affectCNY > 0);
    updateDisplay();
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
        toSell = amount * rates.CNY;
        if (toSell > balances.CNY) {
            showToast("Недостаточно CNY", false);
            return;
        }
        balances.CNY -= toSell;
        balances.USD += amount;
    }

    amountInput.value = '';
    updateDisplay();
    showToast(`Продано ${currency} за ${amount.toFixed(2)} USD`);
}

// Модальное окно активов
function toggleAssets() {
    const modal = document.getElementById('assets-modal');
    modal.classList.toggle('hidden');
    updateDisplay();
}

// Запуск изменений каждые 12 секунд
setInterval(changeRates, 12000);

// Первое обновление и стартовая новость
updateDisplay();
setTimeout(changeRates, 3000); // первая новость через 3 сек
