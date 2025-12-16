// mock-server.cjs
// Pełny mock backendu dla ITFlow (auth + dashboard + orders + pliki zamówień)

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

/* ------------ CORS + body parser ------------ */
app.use(
  cors({
    origin: true,        // pozwól frontendowi (Vite itp.)
    credentials: true,
  })
);
app.use(express.json());

/* ------------ PROSTA "BAZA DANYCH" W PAMIĘCI ------------ */

// Użytkownik "zalogowany"
const mockUser = {
  id: 1,
  username: "mock_programmer",
  first_name: "Mock",
  last_name: "Programmer",
  email: "programmer@example.com",
  groups: [
    {
      id: 1,
      name: "client", // ważne: dokładnie tak, jak używasz w froncie
    },
  ],
};

// Zamówienia
let nextOrderId = 3;
let orders = [
  {
    id: 1,
    title: "Tworzenie strony WWW",
    description: "Przykładowe zamówienie z mock serwera",
    status: "submitted",
    developer: null,
    manager: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Landing page produktu",
    description: "Drugie testowe zamówienie",
    status: "in_progress",
    developer: null,
    manager: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Pliki do zamówień (mock)
let nextFileId = 4;
const orderFiles = {
  1: [
    {
      id: 1,
      order: 1,
      name: "projekt-ui.zip",
      size: 2 * 1024 * 1024, // 2 MB
      url: "https://example.com/mock/projekt-ui.zip",
    },
    {
      id: 2,
      order: 1,
      name: "instrukcja.pdf",
      size: 500 * 1024, // 0.5 MB
      url: "https://example.com/mock/instrukcja.pdf",
    },
  ],
  2: [
    {
      id: 3,
      order: 2,
      name: "landing-page-v1.zip",
      size: 3 * 1024 * 1024,
      url: "https://example.com/mock/landing-page-v1.zip",
    },
  ],
};

function getLatestOrder() {
  if (!orders.length) return null;
  return orders[0]; // najnowsze na początku listy
}

/* ------------ FAKE AUTH MIDDLEWARE ------------ */
// Na razie ignorujemy token, ale można kiedyś rozbudować
app.use((req, res, next) => {
  next();
});

/* ------------ AUTH ------------ */

// POST /api/token/ – login z users.ts (loginUser)
app.post("/api/token/", (req, res) => {
  const { username, password } = req.body || {};
  console.log("Login attempt:", username, password);

  // W mocku zawsze sukces
  return res.json({
    access: "mock-access-token",
    refresh: "mock-refresh-token",
  });
});

// GET /api/accounts/users/me/ – fetchMe
app.get("/api/accounts/users/me/", (req, res) => {
  res.json({
    id: mockUser.id,
    username: mockUser.username,
    email: mockUser.email,
    groups: mockUser.groups,
  });
});

/* ------------ DASHBOARD ------------ */

// GET /api/accounts/users/dashboard/ – fetchDashboard
app.get("/api/accounts/users/dashboard/", (req, res) => {
  const latestOrder = getLatestOrder();

  const response = {
    user: mockUser,
    groups: mockUser.groups.map((g) => g.name), // np. ["manager"]
    latest_order: latestOrder
      ? {
          ...latestOrder,
          client_detail: "Mock klient",
          manager_detail: mockUser.username,
          developer_detail: null,
        }
      : null,
  };

  res.json(response);
});

/* ------------ ORDERS ------------ */

// GET /api/orders/ – fetchOrders
app.get("/api/orders/", (req, res) => {
  res.json(orders);
});

// POST /api/orders/ – createOrder
app.post("/api/orders/", (req, res) => {
  const { title, description, status, developer, manager } = req.body || {};

  const errors = {};

  if (!title || title.trim() === "") {
    errors.title = ["To pole jest wymagane."];
  }
  if (!description || description.trim() === "") {
    errors.description = ["To pole jest wymagane."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const now = new Date().toISOString();

  const newOrder = {
    id: nextOrderId++,
    title,
    description,
    status: status || "submitted",
    developer: developer ?? null,
    manager: manager ?? mockUser.id,
    created_at: now,
    updated_at: now,
  };

  // nowy na początek
  orders.unshift(newOrder);

  res.status(201).json(newOrder);
});

/* ------------ ORDER FILES (NOWA STRONA SZCZEGÓŁÓW) ------------ */

// GET /api/orders/:id/files/ – lista plików dla zamówienia
app.get("/api/orders/:id/files/", (req, res) => {
  const id = Number(req.params.id);
  const files = orderFiles[id] || [];
  res.json(files);
});

// POST /api/orders/:id/files/send-to-client/ – udaje wysyłkę plików
app.post("/api/orders/:id/files/send-to-client/", (req, res) => {
  const id = Number(req.params.id);
  const { file_ids } = req.body || {};

  console.log(
    `Mock: wysyłanie plików ${JSON.stringify(
      file_ids
    )} dla zamówienia ${id} do klienta`
  );

  return res.json({
    detail: "Pliki zostały (mockowo) wysłane do klienta.",
  });
});

// GET /api/orders/:id/files/download/ – udaje pobieranie (np. ZIP)
app.get("/api/orders/:id/files/download/", (req, res) => {
  const id = Number(req.params.id);
  const fileIds = req.query.file_ids;

  console.log(
    `Mock: pobieranie plików ${JSON.stringify(
      fileIds
    )} dla zamówienia ${id}`
  );

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="mock-files.txt"'
  );
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  res.send(
    `To jest mockowy plik z serwera.\nZamówienie: ${id}\nPliki: ${JSON.stringify(
      fileIds
    )}\n`
  );
});

/* ------------ ROOT / HEALTH ------------ */

app.get("/", (req, res) => {
  res.send(
    "Mock ITFlow API running. Spróbuj GET /api/orders/ albo /api/accounts/users/dashboard/"
  );
});

/* ------------ START ------------ */

app.listen(PORT, () => {
  console.log(`Mock server running at http://127.0.0.1:${PORT}`);
});
