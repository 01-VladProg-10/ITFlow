// Complete mock backend for ITFlow (auth + dashboard + orders + files + notifications)

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------------------------------------------------------ */
/* In-memory "database"                                               */
/* ------------------------------------------------------------------ */

const users = [
  {
    id: 1,
    username: "client_user",
    first_name: "Klara",
    last_name: "Client",
    email: "klara.client@example.com",
    company: "ACME Corp",
    groups: [{ id: 1, name: "client" }],
  },
  {
    id: 2,
    username: "manager_user",
    first_name: "Marek",
    last_name: "Manager",
    email: "marek.manager@example.com",
    company: "ITFlow",
    groups: [{ id: 2, name: "manager" }],
  },
  {
    id: 3,
    username: "prog_user",
    first_name: "Paula",
    last_name: "Programmer",
    email: "paula.programmer@example.com",
    company: "ITFlow",
    groups: [{ id: 3, name: "programmer" }],
  },
];

let nextUserId = 4;
let activeUser = users[0];

function pickUserByLogin(username) {
  const lowered = String(username || "").toLowerCase();
  if (lowered.includes("manager")) {
    activeUser = users.find((u) => u.username === "manager_user") || users[1];
  } else if (lowered.includes("prog") || lowered.includes("dev")) {
    activeUser = users.find((u) => u.username === "prog_user") || users[2];
  } else {
    const existing = users.find((u) => u.username === username);
    activeUser = existing || users[0];
  }
  return activeUser;
}

function publicUser(user) {
  const { id, username, first_name, last_name, email, company, groups } = user;
  return { id, username, first_name, last_name, email, company, groups };
}

let nextOrderId = 4;
let orders = [
  {
    id: 1,
    title: "Landing page produktu",
    description: "Projekt i wdrozenie landing page dla nowej aplikacji.",
    status: "submitted",
    developer: null,
    manager: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Panel klienta B2B",
    description: "Dodanie logowania SSO oraz sekcji billing.",
    status: "in_progress",
    developer: 3,
    manager: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 3,
    title: "Sklep internetowy",
    description: "Integracja platnosci i wydanie MVP.",
    status: "awaiting_review",
    developer: 3,
    manager: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

let nextFileId = 6;
const orderFiles = {
  1: [
    {
      id: 1,
      order: 1,
      name: "brief.pdf",
      description: "Podsumowanie wymagan",
      file_type: "pdf",
      size: 120_000,
      visible_to_clients: true,
      uploaded_file_url: "https://mock.local/files/brief.pdf",
    },
  ],
  2: [
    {
      id: 2,
      order: 2,
      name: "ui-kit.zip",
      description: "Komponenty UI",
      file_type: "zip",
      size: 2_400_000,
      visible_to_clients: false,
      uploaded_file_url: "https://mock.local/files/ui-kit.zip",
    },
    {
      id: 3,
      order: 2,
      name: "sprint-notes.pdf",
      description: "Notatki z ostatniego sprintu",
      file_type: "pdf",
      size: 300_000,
      visible_to_clients: true,
      uploaded_file_url: "https://mock.local/files/sprint-notes.pdf",
    },
  ],
  3: [
    {
      id: 4,
      order: 3,
      name: "raport-testow.pdf",
      description: "Testy przed wysylka do klienta",
      file_type: "pdf",
      size: 510_000,
      visible_to_clients: true,
      uploaded_file_url: "https://mock.local/files/raport-testow.pdf",
    },
    {
      id: 5,
      order: 3,
      name: "build.zip",
      description: "Build kandydujacy",
      file_type: "zip",
      size: 1_600_000,
      visible_to_clients: false,
      uploaded_file_url: "https://mock.local/files/build.zip",
    },
  ],
};

let nextLogId = 8;
const orderLogs = {
  1: [
    {
      id: 1,
      event_type: "status_change",
      description: "Status zmieniony z submitted na accepted",
      old_value: "submitted",
      new_value: "accepted",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      actor_name: "manager_user",
    },
    {
      id: 2,
      event_type: "file_added",
      description: "brief.pdf",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      actor_name: "manager_user",
    },
  ],
  2: [
    {
      id: 3,
      event_type: "assignment",
      description: "Przypisano developera prog_user",
      old_value: "",
      new_value: "prog_user",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      actor_name: "manager_user",
    },
    {
      id: 4,
      event_type: "status_change",
      description: "Status zmieniony z accepted na in_progress",
      old_value: "accepted",
      new_value: "in_progress",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      actor_name: "prog_user",
    },
    {
      id: 5,
      event_type: "file_added",
      description: "ui-kit.zip",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      actor_name: "prog_user",
    },
  ],
  3: [
    {
      id: 6,
      event_type: "status_change",
      description: "Status zmieniony z in_progress na client_review",
      old_value: "in_progress",
      new_value: "client_review",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      actor_name: "prog_user",
    },
    {
      id: 7,
      event_type: "status_change",
      description: "Status zmieniony z client_review na awaiting_review",
      old_value: "client_review",
      new_value: "awaiting_review",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      actor_name: "manager_user",
    },
  ],
};

let nextContactId = 3;
let contactMessages = [
  {
    id: 1,
    first_name: "Anna",
    last_name: "Nowak",
    email: "anna@example.com",
    request_message: "Czy moge dodac nowy adres rozliczeniowy?",
    response_message: null,
    is_answered: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    first_name: "Piotr",
    last_name: "Kowalski",
    email: "piotr@example.com",
    request_message: "Prosze o fakture pro forma.",
    response_message: "Wyslalismy fakture pro forma na maila.",
    is_answered: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function nowIso() {
  return new Date().toISOString();
}

function findOrder(id) {
  return orders.find((o) => o.id === id);
}

function latestOrder() {
  return orders[0] || null;
}

function addLog(orderId, log) {
  const entry = {
    id: nextLogId++,
    event_type: log.event_type || "other",
    description: log.description || "",
    old_value: log.old_value || "",
    new_value: log.new_value || "",
    timestamp: log.timestamp || nowIso(),
    actor_name: log.actor_name || activeUser.username,
  };
  if (!orderLogs[orderId]) orderLogs[orderId] = [];
  orderLogs[orderId].push(entry);
  return entry;
}

async function parseMultipart(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) {
    return { fields: {}, file: null };
  }
  const boundary = boundaryMatch[1];
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  const raw = buffer.toString("binary");
  const parts = raw.split(`--${boundary}`);

  const fields = {};
  let file = null;

  for (const part of parts) {
    if (!part || part === "--\r\n" || part === "--") continue;
    const [rawHeaders, rawValue] = part.split("\r\n\r\n");
    if (!rawHeaders || !rawValue) continue;
    const value = rawValue.slice(0, -2); // remove trailing CRLF
    const nameMatch = rawHeaders.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];
    const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);
    if (filenameMatch && filenameMatch[1]) {
      const filename = filenameMatch[1] || "upload.bin";
      const buf = Buffer.from(value, "binary");
      const mimeMatch = rawHeaders.match(/Content-Type:\s?([^\r\n]+)/i);
      file = {
        field: fieldName,
        filename,
        size: buf.length,
        buffer: buf,
        mime: mimeMatch ? mimeMatch[1].trim() : "application/octet-stream",
      };
    } else {
      fields[fieldName] = value;
    }
  }

  return { fields, file };
}

function withDetails(order) {
  if (!order) return null;
  const manager = users.find((u) => u.id === order.manager);
  const developer = users.find((u) => u.id === order.developer);
  return {
    ...order,
    client_detail: "Demo client",
    manager_detail: manager?.username || null,
    developer_detail: developer?.username || null,
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

app.post("/api/token/", (req, res) => {
  const { username } = req.body || {};
  const user = pickUserByLogin(username);
  const access = `mock-access-${user.username}-${Date.now()}`;
  const refresh = `mock-refresh-${Date.now()}`;

  res.cookie("refresh", refresh, { httpOnly: false, sameSite: "lax" });
  res.json({ access, refresh });
});

app.post("/api/token/refresh/", (req, res) => {
  const access = `mock-access-${activeUser.username}-${Date.now()}`;
  res.json({ access });
});

app.post("/api/accounts/users/register/", (req, res) => {
  const { username, first_name, last_name, email, password, password_verify } =
    req.body || {};
  const errors = {};
  if (!username) errors.username = ["To pole jest wymagane."];
  if (!email) errors.email = ["To pole jest wymagane."];
  if (!password) errors.password = ["To pole jest wymagane."];
  if (password && password !== password_verify) {
    errors.password_verify = ["Hasla musza byc identyczne."];
  }
  if (users.some((u) => u.username === username)) {
    errors.username = ["Uzytkownik o tej nazwie juz istnieje."];
  }
  if (Object.keys(errors).length) return res.status(400).json(errors);

  const newUser = {
    id: nextUserId++,
    username,
    first_name: first_name || "",
    last_name: last_name || "",
    email,
    company: "",
    groups: [{ id: 1, name: "manager" }],
  };
  users.push(newUser);
  res.status(201).json(publicUser(newUser));
});

app.get("/api/accounts/users/me/", (req, res) => {
  res.json(publicUser(activeUser));
});

app.put("/api/accounts/users/me/", (req, res) => {
  const updates = req.body || {};
  activeUser = {
    ...activeUser,
    username: updates.username || activeUser.username,
    first_name: updates.first_name || activeUser.first_name,
    last_name: updates.last_name || activeUser.last_name,
    email: updates.email || activeUser.email,
    company: updates.company || activeUser.company || "",
  };
  res.json(publicUser(activeUser));
});

app.get("/api/accounts/users/dashboard/", (req, res) => {
  res.json({
    user: publicUser(activeUser),
    groups: (activeUser.groups || []).map((g) => g.name),
    latest_order: withDetails(latestOrder()),
  });
});

app.get("/api/accounts/users/programmers/", (req, res) => {
  const programmers = users.filter((u) =>
    u.groups.some((g) => g.name === "programmer")
  );
  res.json(programmers.map(publicUser));
});

/* ------------------------------------------------------------------ */
/* Orders                                                             */
/* ------------------------------------------------------------------ */

app.get("/api/orders/", (req, res) => {
  res.json(orders);
});

app.post("/api/orders/", (req, res) => {
  const { title, description, status, developer, manager } = req.body || {};
  const errors = {};
  if (!title) errors.title = ["To pole jest wymagane."];
  if (!description) errors.description = ["To pole jest wymagane."];
  if (Object.keys(errors).length) return res.status(400).json(errors);

  const now = nowIso();
  const order = {
    id: nextOrderId++,
    title,
    description,
    status: status || "submitted",
    developer: developer ?? null,
    manager: manager ?? activeUser.id ?? null,
    created_at: now,
    updated_at: now,
  };
  orders.unshift(order);
  addLog(order.id, {
    event_type: "status_change",
    description: `Status ustawiony na ${order.status}`,
    new_value: order.status,
    actor_name: activeUser.username,
  });
  res.status(201).json(order);
});

app.post("/api/orders/:id/change-status/", (req, res) => {
  const id = Number(req.params.id);
  const order = findOrder(id);
  if (!order) return res.status(404).json({ detail: "Order not found" });

  const { status } = req.body || {};
  if (!status) return res.status(400).json({ status: ["Brak statusu."] });

  const old = order.status;
  order.status = status;
  order.updated_at = nowIso();

  addLog(order.id, {
    event_type: "status_change",
    description: `Status zmieniony z "${old}" na "${status}"`,
    old_value: old,
    new_value: status,
    actor_name: activeUser.username,
  });

  res.json(order);
});

app.post("/api/orders/:id/assign-developer/", (req, res) => {
  const id = Number(req.params.id);
  const order = findOrder(id);
  if (!order) return res.status(404).json({ detail: "Order not found" });

  const { developer } = req.body || {};
  const oldDev = order.developer;

  order.developer = developer ?? null;
  order.manager = order.manager || activeUser.id || null;
  order.updated_at = nowIso();

  const devUser = users.find((u) => u.id === order.developer);
  addLog(order.id, {
    event_type: "assignment",
    description: devUser
      ? `Przypisano developera ${devUser.username}`
      : "Usunieto przypisanego developera",
    old_value: oldDev ? String(oldDev) : "",
    new_value: order.developer ? String(order.developer) : "",
    actor_name: activeUser.username,
  });

  res.json(order);
});

/* ------------------------------------------------------------------ */
/* Files                                                              */
/* ------------------------------------------------------------------ */

app.get("/api/files/order/:id/", (req, res) => {
  const id = Number(req.params.id);
  res.json(orderFiles[id] || []);
});

app.post("/api/files/upload/", async (req, res) => {
  const { fields, file } = await parseMultipart(req);
  const orderId = Number(fields.order);
  if (!orderId) return res.status(400).json({ order: ["Order is required"] });
  const order = findOrder(orderId);
  if (!order) return res.status(404).json({ detail: "Order not found" });

  const name = fields.name || file?.filename || `plik-${nextFileId}`;
  const visible =
    String(fields.visible_to_clients ?? "false").toLowerCase() === "true";

  const newFile = {
    id: nextFileId++,
    order: orderId,
    name,
    description: fields.description || "",
    file_type: fields.file_type || file?.mime || "other",
    size: file?.size || 250_000,
    visible_to_clients: visible,
    uploaded_file_url: `https://mock.local/uploads/${encodeURIComponent(name)}`,
  };

  if (!orderFiles[orderId]) orderFiles[orderId] = [];
  orderFiles[orderId].push(newFile);
  order.updated_at = nowIso();

  addLog(orderId, {
    event_type: "file_added",
    description: newFile.name,
    actor_name: activeUser.username,
  });

  res.status(201).json(newFile);
});

app.patch("/api/files/:id/visibility/", (req, res) => {
  const fileId = Number(req.params.id);
  const { visible_to_clients } = req.body || {};
  const target = Object.values(orderFiles)
    .flat()
    .find((f) => f.id === fileId);
  if (!target) return res.status(404).json({ detail: "File not found" });
  if (typeof visible_to_clients !== "boolean") {
    return res.status(400).json({ visible_to_clients: ["Expected boolean"] });
  }

  target.visible_to_clients = visible_to_clients;
  addLog(target.order, {
    event_type: "comment",
    description: `Widocznosc pliku ${target.name} ustawiona na ${visible_to_clients}`,
    actor_name: activeUser.username,
  });
  res.json(target);
});

app.get("/api/files/order/:id/final_report/", (req, res) => {
  const id = Number(req.params.id);
  const content = `Mock final report for order ${id}\nGenerated at ${nowIso()}\n`;
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="mock-final-report-${id}.pdf"`
  );
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(content));
});

/* Compatibility with older endpoints kept for safety */
app.get("/api/orders/:id/files/", (req, res) => {
  const id = Number(req.params.id);
  res.json(orderFiles[id] || []);
});

app.post("/api/orders/:id/files/send-to-client/", (req, res) => {
  res.json({ detail: "Pliki zostaly (mockowo) wyslane do klienta." });
});

app.get("/api/orders/:id/files/download/", (req, res) => {
  const id = Number(req.params.id);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="mock-files-${id}.txt"`
  );
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(`Zamowienie: ${id}\nPobrano z mock serwera.\n`);
});

/* ------------------------------------------------------------------ */
/* Order history / logs                                               */
/* ------------------------------------------------------------------ */

app.get("/api/order-log/order-history/:orderId/", (req, res) => {
  const id = Number(req.params.orderId);
  res.json(orderLogs[id] || []);
});

/* ------------------------------------------------------------------ */
/* Notifications / contact                                            */
/* ------------------------------------------------------------------ */

app.post("/api/notifications/contact/", (req, res) => {
  const { first_name, last_name, email, request_message } = req.body || {};
  const errors = {};
  if (!first_name) errors.first_name = ["To pole jest wymagane."];
  if (!last_name) errors.last_name = ["To pole jest wymagane."];
  if (!email) errors.email = ["To pole jest wymagane."];
  if (!request_message) errors.request_message = ["To pole jest wymagane."];
  if (Object.keys(errors).length) return res.status(400).json(errors);

  const msg = {
    id: nextContactId++,
    first_name,
    last_name,
    email,
    request_message,
    response_message: null,
    is_answered: false,
    created_at: nowIso(),
  };
  contactMessages.unshift(msg);
  res.status(201).json(msg);
});

app.get("/api/notifications/contact/all/", (req, res) => {
  res.json(contactMessages);
});

app.get("/api/notifications/contact/:id/", (req, res) => {
  const id = Number(req.params.id);
  const msg = contactMessages.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ detail: "Not found" });
  res.json(msg);
});

app.post("/api/notifications/contact/:id/respond/", (req, res) => {
  const id = Number(req.params.id);
  const msg = contactMessages.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ detail: "Not found" });

  const { response_message } = req.body || {};
  if (!response_message) {
    return res
      .status(400)
      .json({ response_message: ["To pole jest wymagane."] });
  }

  msg.response_message = response_message;
  msg.is_answered = true;
  res.json(msg);
});

app.post("/api/notifications/order/:orderId/send-email/", async (req, res) => {
  const { fields } = await parseMultipart(req);
  const orderId = Number(req.params.orderId);
  const order = findOrder(orderId);
  if (!order) return res.status(404).json({ detail: "Order not found" });

  const subject = fields.subject || "Mock email";
  addLog(orderId, {
    event_type: "comment",
    description: `Wyslano email: ${subject}`,
    actor_name: activeUser.username,
  });

  res.json({
    success: true,
    message: "Email zostal (mockowo) wyslany do klienta.",
  });
});

/* ------------------------------------------------------------------ */
/* Root / health                                                      */
/* ------------------------------------------------------------------ */

app.get("/", (req, res) => {
  res.send(
    "Mock ITFlow API running. Dostepne: /api/token/, /api/orders/, /api/files/order/:id/"
  );
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://127.0.0.1:${PORT}`);
});
