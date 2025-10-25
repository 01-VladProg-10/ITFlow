# ITFlow

## 📌 Opis projektu
**ITFlow** to projekt full-stack z wyraźnym podziałem na frontend i backend.  
Repozytorium jest skonfigurowane tak, aby zespół mógł pracować bezpiecznie i uporządkowanie.

- **Frontend:** gałąź `frontend`
- **Backend:** gałąź `backend`
- **Stabilna wersja:** gałąź `main`

---

## 👥 Zespół
- Frontend: osoba 1, osoba 2  
- Backend: osoba 3, osoba 4  

Każdy pracuje na swojej gałęzi, a zmiany do main trafiają tylko po review.

---

## 🌿 Struktura repozytorium

```

ITFlow/
├── frontend/      # kod frontendowy
├── backend/       # kod backendowy
└── README.md      # instrukcje i dokumentacja

````

---

## ⚡ Workflow pracy krok po kroku

### 1️⃣ Skopiowanie repozytorium
Na początku każdy klonuje repo lokalnie:
```bash
git clone https://github.com/01-VladProg-10/ITFlow.git
cd ITFlow
````

---

### 2️⃣ Przejście na odpowiednią gałąź

Frontend:

```bash
git checkout frontend
git pull origin frontend
```

Backend:

```bash
git checkout backend
git pull origin backend
```

---

### 3️⃣ Tworzenie nowej funkcjonalności (feature branch)

Tworzymy osobną gałąź roboczą:

```bash
git checkout -b feature/nazwa-funkcji
```

> Przykład: `feature/login-page`

---

### 4️⃣ Praca nad kodem i commitowanie

1. Wprowadzaj zmiany w odpowiednich folderach (`frontend/` lub `backend/`)
2. Sprawdź status:

```bash
git status
```

3. Dodaj zmienione pliki:

```bash
git add .
```

4. Zrób commit z opisem zmian:

```bash
git commit -m "feat: dodano stronę logowania"
```

---

### 5️⃣ Wysyłanie gałęzi do GitHub (push)

```bash
git push -u origin feature/nazwa-funkcji
```

> `-u origin` ustawia domyślny upstream, więc w przyszłości wystarczy `git push`.

---

### 6️⃣ Tworzenie Pull Requesta (PR)

1. Na GitHubie kliknij **Compare & pull request** dla swojej gałęzi.
2. Wybierz **base branch:** `frontend` lub `backend`.
3. Dodaj opis zmian, kliknij **Create pull request**.
4. Poczekaj na **review od zespołu**.
5. Jeśli PR zostanie zatwierdzony, kliknij **Merge pull request**.

---

### 7️⃣ Aktualizacja `frontend` / `backend`

Po scaleniu PR w swojej gałęzi:

```bash
git checkout frontend  # lub backend
git pull origin frontend
```

---

### 8️⃣ Merge do `main`

Kiedy zmiany są stabilne:

1. Utwórz PR: `frontend` → `main` lub `backend` → `main`
2. Poczekaj na review
3. Scal do `main`

---

## 🛠️ Zasady pracy w repozytorium

* Każda zmiana w `main`, `frontend` i `backend` musi przejść **PR + review**.
* Każdy PR wymaga co najmniej **1 zatwierdzenia**.
* Nie wolno robić **bezpośredniego push do chronionych gałęzi**.
* Historia commitów powinna być **linearna** (squash/rebase).
* Nowe funkcje zawsze w osobnej gałęzi (`feature/`).

---

## 💡 Wskazówki dla zespołu

* **Opis commitów:** krótki, jasny i zrozumiały, np. `feat: dodano przycisk logowania`.
* **Branch naming:**

  * Feature: `feature/nazwa-funkcji`
  * Bugfix: `bugfix/opis-błędu`
* **Pull Requests:** zawsze dodaj opis co zmienia kod i jak przetestować.

```
