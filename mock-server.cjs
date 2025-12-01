// mock-server.js
// Prosty serwer mockujący backend dla /api/orders/

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

// pozwalamy na CORS z frontu (Vite zwykle 5173)
app.use(
  cors({
    origin: true, // akceptuj wszystko (localhost / 127.0.0.1)
    credentials: true,
  })
);

app.use(express.json());

// PROSTA "BAZA" W PAMIECI
let nextId = 3;
let orders = [
  {
    id: 1,
    title: "Tworzenie strony WWWI",
    description: "Przykładowe zamówienie z mock serwera",
    status: "submitted",
    developer: null,
    manager: null,
  },
  {
    id: 2,
    title: "Landing page produktu",
    description: "Drugie testowe zamówienie",
    status: "in_progress",
    developer: null,
    manager: null,
  },
];

// mały middleware udający autoryzację – po prostu ignoruje token
app.use((req, res, next) => {
  // normalnie tu byłoby sprawdzanie Authorization / cookies
  next();
});

// === GET /api/orders/ ===
// Task5 – zwracamy listę zamówień
app.get("/api/orders/", (req, res) => {
  res.json(orders);
});

// === POST /api/orders/ ===
// Task1 – tworzenie zamówienia
app.post("/api/orders/", (req, res) => {
  const { title, description, status, developer, manager } = req.body || {};

  const errors = {};

  if (!title || title.trim() === "") {
    errors.title = ["To pole jest wymagane."];
  }
  if (!description || description.trim() === "") {
    errors.description = ["To pole jest wymagane."];
  }

  // jeśli są błędy – zwracamy jak backend DRF
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const newOrder = {
    id: nextId++,
    title,
    description,
    status: status || "submitted",
    developer: developer ?? null,
    manager: manager ?? null,
  };

  orders.unshift(newOrder);

  res.status(201).json(newOrder);
});

// === DASHBOARD MOCK ===
// GET /api/accounts/users/dashboard/
app.get("/api/accounts/users/dashboard/", (req, res) => {
  // Беремо "останнє замовлення" як перше з масиву (як у реальному backend’і)
  const latestOrder = orders[0] || null;

  const response = {
    user: {
      id: 1,
      username: "mock_user",
      first_name: "Mock",
      last_name: "User",
      email: "mock@example.com",
      groups: [
        {
          id: 1,
          // змінюй тут "client" / "manager" / "programmer",
          // щоб перевіряти різні dashboardy
          name: "manager",
        },
      ],
    },
    // тут дублюємо назву ролі — так, як у prawdziwym JSON
    groups: ["manager"],
    latest_order: latestOrder
      ? {
          ...latestOrder,
          client_detail: "mock_client",
          manager_detail: null,
          developer_detail: null,
        }
      : null,
  };

  res.json(response);
});

// fallback – info że serwer działa
app.get("/", (req, res) => {
  res.send("Mock ITFlow API running on /api/orders/");
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://127.0.0.1:${PORT}`);
});

