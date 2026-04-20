---

# 🧪 Тестовое задание: Панель управления заказами (Order Management Dashboard)

**Позиция:** Strong Junior / Middle Frontend Developer
**Дедлайн:** 8 рабочих часов

---

## 📌 Контекст

Ты — единственный frontend-разработчик в стартапе, который делает TMS (Transportation Management System).
Бэкенд ещё не готов, но PM уже утвердил первый модуль — управление заказами.

Твоя задача — сделать рабочий прототип с **mock API**, чтобы команда могла:

* оценить UX
* подготовить backend на основе твоих data-контрактов

---

## 📦 Результаты (Deliverables)

1. Публичный GitHub-репозиторий с осмысленной историей коммитов
2. Задеплоенное приложение (Vercel или Netlify)
3. `README.md`, в котором:

   * инструкция по запуску
   * архитектурные решения с объяснениями
   * что бы ты улучшил при наличии большего времени

---

## 🛠 Требуемый стек

| Слой             | Технология                                                  |
| ---------------- | ----------------------------------------------------------- |
| Framework        | React 18+                                                   |
| Язык             | TypeScript (strict mode)                                    |
| Routing          | React Router v6+                                            |
| Стили            | Tailwind CSS                                                |
| UI компоненты    | shadcn/ui или Radix UI                                      |
| State management | Zustand / Redux Toolkit / React Query (обосновать в README) |
| Формы            | React Hook Form + Zod                                       |
| Сборка           | Vite                                                        |
| Линтинг          | ESLint + Prettier                                           |

---

## 📊 Модель данных

### Draft vs Order

|               | Draft Order           | Order                                        |
| ------------- | --------------------- | -------------------------------------------- |
| Хранение      | localStorage (клиент) | Mock API (сервер)                            |
| Создание      | при открытии вкладки  | при нажатии "Submit Draft"                   |
| Статусы       | нет (WIP)             | pending → in_transit → delivered / cancelled |
| Заполненность | может быть неполным   | валидируется                                 |

### Flow

Открытие диалога → создание draft (вкладки) → заполнение → переключение между вкладками →
"Submit Draft" → создаётся Order со статусом `pending` → вкладка закрывается

---

## 🧾 Типы

```ts
type OrderStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled'
type EquipmentType = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck'
type LoadType = 'ftl' | 'ltl'
type StopType = 'pick_up' | 'drop_off' | 'stop'
type AppointmentType = 'fixed' | 'window' | 'fcfs'

interface Carrier {
  id: string
  name: string
  mcNumber: string
  phone: string
  rating: number // 1-5
}

interface Order {
  id: string
  referenceNumber: string
  status: OrderStatus
  clientName: string
  carrier: Carrier
  equipmentType: EquipmentType
  loadType: LoadType
  stops: Stop[] // min 2, max 5
  weight: number
  rate: number
  notes: string
  statusHistory: StatusChange[]
  createdAt: string
  updatedAt: string
}

interface Stop {
  id: string
  type: StopType
  order: number
  address: Address
  locationName?: string
  refNumber?: string
  appointmentType: AppointmentType
  appointmentDate: string | null
  notes?: string
}

interface Address {
  city: string
  state: string
  zip: string
}

interface StatusChange {
  from: OrderStatus | null
  to: OrderStatus
  changedAt: string
  note?: string
}

interface LocalDraft {
  id: string
  title: string
  formData: Partial<CreateOrderInput>
  savedAt: string
}
```

---

## 🔌 Mock API

### Данные

* 30+ заказов (разные статусы, города США, последние 60 дней)
* 15 перевозчиков
* 2–5 остановок на заказ
* 2–4 записи в истории статусов

### Поведение

```ts
await delay(300 + Math.random() * 500)
```

* ~5% запросов возвращают ошибки

### Методы

```ts
// Orders
getOrders(params)
getOrder(id)
createOrder(data)
updateOrder(id, data)
deleteOrder(id) // только pending
updateOrderStatus(id, status, note?)

// Carriers
getCarriers(params?)
```

---

## ✅ Функциональные требования

### 1. 📋 Таблица заказов — `/orders`

Колонки:

* Reference #
* Status (цветной бейдж)
* Route
* Carrier
* Equipment
* Pickup Date
* Rate
* Stops count
* Actions

Функционал:

* Пагинация (10/25/50)
* Сортировка (pickupDate, rate, status)
* Фильтры (status + поиск с debounce 300ms)
* Loading / Empty / Error states
* Inline смена статуса
* Drafts секция (Resume / Discard)
* Actions:

  * View
  * Edit (только pending)
  * Duplicate as Draft
  * Change status
  * Delete

---

### 2. 📝 Draft Workspace — `/orders/new`

* Полноэкранный интерфейс
* До 5 вкладок (drafts)
* Восстановление из localStorage

#### Header:

* [+] новая вкладка
* DRAFT SAVED
* CLEAR ALL
* DELETE DRAFT
* SUBMIT DRAFT
* CLOSE

#### Форма (3 секции):

1. Client
2. Order
3. Stops

#### Stops:

* min 2, max 5
* reorder (↑↓)
* delete (×)

#### Валидация:

* через Zod
* ошибки inline
* при submit:

  * scroll к первой ошибке
  * spinner
  * toast при ошибке

---

### 3. 💾 Автосохранение

* каждые 5 секунд или blur
* localStorage:

  * `draft:{id}`
  * `draft:index`
* восстановление вкладок при перезапуске
* удаление после submit

---

### 4. ✏️ Редактирование — `/orders/:id/edit`

* Только для `pending`
* Предзаполненная форма

---

### 5. 🔍 Детали заказа — `/orders/:id`

Содержит:

* общую инфу
* список остановок
* историю статусов (timeline)

---

### 6. 🔄 State Machine

```
Draft → pending → in_transit → delivered
                  ↘
                   cancelled
```

Правила:

* pending → in_transit / cancelled
* in_transit → delivered / cancelled
* delivered — финал
* cancelled — финал

---

### 7. 🗑 Удаление

* Draft → удаляется из localStorage
* Order → только `pending`

---

## ⚙️ Нефункциональные требования

| Требование     | Описание           |
| -------------- | ------------------ |
| UI/UX          | основной критерий  |
| Persistence    | данные сохраняются |
| Performance    | без лагов          |
| Error handling | retry, toast       |

---

## 📊 Оценка

| Критерий    | Вес |
| ----------- | --- |
| UX/UI       | 25% |
| Архитектура | 20% |
| TypeScript  | 20% |
| State/data  | 15% |
| Код         | 10% |
| README      | 10% |

---

## ❓ FAQ

* UI библиотека — только shadcn/ui или Radix
* Тесты — бонус
* AI использовать можно
* Не успеваешь?
  👉 Приоритет:

  1. Таблица
  2. Форма создания
  3. Страница деталей
  4. Мульти-драфты
