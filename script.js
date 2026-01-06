// script.js
// Инициализация Telegram Web App
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Состояние игры
let balances = {
    USD: 100.00,
    EUR: 0.00,
    CNY: 0.00
};

let rates = {
    EUR: 1.10, // EUR/USD
    CNY: 7.00  // CNY/USD
};

// Массивы новостей (30 положительных и 30 отрицательных)
const positiveNews = [
    "Экономика растёт!", "Подписано торговое соглашение!", "Снижены процентные ставки!", "Фондовый рынок взлетел!", "Безработица снизилась!",
    "ВВП превысил ожидания!", "Инфляция под контролем!", "Технологический прорыв!", "Цены на нефть упали!", "Туризм резко вырос!",
    "Экспорт увеличился!", "Приток инвестиций!", "Валюта укрепилась!", "Подписан мирный договор!", "Успех вакцины!",
    "Бум возобновляемой энергии!", "Рынок жилья растёт!", "Потребительские расходы выросли!", "Прибыль компаний взлетела!",
    "Объявлен фискальный стимул!", "Технологические акции растут!", "Цены на сырьё повысились!", "Глобальная торговля улучшилась!",
    "Центробанк поддерживает экономику!", "Открыт инновационный хаб!", "Создано много рабочих мест!", "Цепочки поставок стабилизировались!",
    "Рост слияний и поглощений!", "Индекс уверенности растёт!", "Норма сбережений улучшилась!"
];

const negativeNews = [
    "Опасения рецессии!", "Эскалация торговой войны!", "Повышены процентные ставки!", "Крах фондового рынка!", "Безработица растёт!",
    "ВВП сократился!", "Скачок инфляции!", "Лопнул технологический пузырь!", "Цены на нефть взлетели!", "Туризм упал!",
    "Экспорт снизился!", "Отток капитала!", "Валюта ослабла!", "Напряжённость из-за войны!", "Вспышка пандемии!",
    "Энергетический кризис!", "Крах рынка жилья!", "Потребительские расходы упали!", "Компании терпят убытки!",
    "Меры жёсткой экономии!", "Массовые увольнения в IT!", "Цены на сырьё рухнули!", "Глобальная торговля замедлилась!",
    "Центробанк ужесточает политику!", "Инновации застопорились!", "Массовые потери рабочих мест!", "Нарушения цепочек поставок!",
    "Рост банкротств!", "Индекс уверенности падает!", "Долговой кризис усугубляется!"
];

// Обновление отображения
function updateDisplay() {
    document.getElementById('usd-balance').textContent = balances.USD.toFixed(2);
    document.getElementById('eur-balance').textContent = balances.EUR.toFixed(2);
    document.getElementById('cny-balance').textContent = balances.CNY.toFixed(2);
    document.getElementById('eur-rate').textContent = rates.EUR.toFixed(4);
    document.getElementById('cny-rate').textContent = rates.CNY.toFixed(4);
}

// Добавление новости
function addNews(message, isPositive) {
    const newsFeed = document.getElementById('news-feed');
    const newsItem = document.createElement('p');
    newsItem.textContent = message;
    newsItem.style.color = isPositive ? '#007aff' : '#ff3b30';
    newsItem.style.fontWeight = '500';
    newsFeed.appendChild(newsItem);
    newsFeed.scrollTop = newsFeed.scrollHeight;
}

// Изменение курсов
function changeRates() {
    const isPositive = Math.random() > 0.5;
    const newsArray = isPositive ? positiveNews : negativeNews;
    const newsIndex = Math.floor(Math.random() * newsArray.length);
    const news = newsArray[newsIndex];
    addNews(news, isPositive);

    // Изменение курсов с учётом новости
    const changeEur = (Math.random() * 0.02 - 0.01) + (isPositive ? 0.015 : -0.015);
    rates.EUR += changeEur;
    rates.EUR = Math.max(0.80, Math.min(1.50, rates.EUR)); // Ограничения

    const changeCny = (Math.random() * 0.3 - 0.15) + (isPositive ? 0.08 : -0.08);
    rates.CNY += changeCny;
    rates.CNY = Math.max(5.5, Math.min(8.5, rates.CNY));

    updateDisplay();
}

// Покупка
function buy(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0 || amount > balances.USD) {
        alert('Неверная сумма или недостаточно USD');
        return;
    }

    if (currency === 'EUR') {
        const eurBought = amount / rates.EUR;
        balances.EUR += eurBought;
        balances.USD -= amount;
    } else if (currency === 'CNY') {
        const cnyBought = amount * rates.CNY;
        balances.CNY += cnyBought;
        balances.USD -= amount;
    }

    amountInput.value = '';
    updateDisplay();
}

// Продажа
function sell(currency) {
    const amountInput = document.getElementById(`${currency.toLowerCase()}-amount`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }

    if (currency === 'EUR') {
        const eurToSell = amount / rates.EUR;
        if (eurToSell > balances.EUR) {
            alert('Недостаточно EUR');
            return;
        }
        balances.EUR -= eurToSell;
        balances.USD += amount;
    } else if (currency === 'CNY') {
        const cnyToSell = amount * rates.CNY;
        if (cnyToSell > balances.CNY) {
            alert('Недостаточно CNY');
            return;
        }
        balances.CNY -= cnyToSell;
        balances.USD += amount;
    }

    amountInput.value = '';
    updateDisplay();
}

// Изменение курсов каждые 12 секунд
setInterval(changeRates, 12000);

// Первое обновление
updateDisplay();
// Первая новость сразу при запуске
changeRates();
