```markdown
# ITFlow

Prosta aplikacja składająca się z frontend, backend i bazy danych PostgreSQL, uruchamiana przy użyciu **Docker Compose**.

## Wymagania

* [Docker](https://www.docker.com/) (wersja ≥ 20)  
* [Docker Compose](https://docs.docker.com/compose/) (wersja ≥ 1.29)  
* Git (opcjonalnie, jeśli klonujesz repozytorium)  

## Struktura projektu

```

ITFlow/
├─ Frontend/        # aplikacja frontend (np. React/Vue)
├─ Backend/         # aplikacja backend (np. Django / Node.js/Express)
├─ docker-compose.yml
└─ README.md

````

---

## Konfiguracja

1. Skopiuj repozytorium:

```bash
git clone <URL_DO_REPO>
cd ITFlow
````

2. (Opcjonalnie) Zmodyfikuj ustawienia bazy danych w `docker-compose.yml`:

```yaml
POSTGRES_DB: itflow
POSTGRES_USER: itflow
POSTGRES_PASSWORD: itflow
POSTGRES_HOST: database
POSTGRES_PORT: 5432
```

> Domyślne ustawienia działają bez zmian.

---

## Uruchomienie aplikacji

1. Zbuduj i uruchom wszystkie serwisy:

```bash
docker-compose up --build
```

2. Wykonaj migracje bazy danych w backendzie (jeśli backend to Django):

```bash
docker-compose exec backend python manage.py migrate
```

> Dzięki temu wszystkie tabele w bazie zostaną utworzone poprawnie.

3. (Opcjonalnie) Utwórz superusera w backendzie:

```bash
docker-compose exec backend python manage.py createsuperuser
```

> Superuser umożliwia pełny dostęp do panelu administracyjnego backendu.

4. Sprawdź logi kontenerów w terminalu.

   * Frontend dostępny na: [http://localhost:5173](http://localhost:5173)
   * Backend dostępny na: [http://localhost:8080](http://localhost:8080)
   * PostgreSQL dostępny na porcie: `5433` (host), `5432` (kontener)

5. Aby zatrzymać aplikację:

```bash
docker-compose down
```

> Jeśli chcesz zachować dane bazy, nie używaj opcji `-v`, ponieważ usuwa wolumeny.

---

## Wolumeny

* `itflow_pgdata` – przechowuje dane PostgreSQL między restartami kontenerów.

---

## Przydatne komendy

* **Zbudowanie tylko jednego serwisu**:

```bash
docker-compose build frontend
docker-compose build backend
```

* **Uruchomienie w tle (detached mode)**:

```bash
docker-compose up -d
```

* **Sprawdzenie statusu kontenerów**:

```bash
docker-compose ps
```

* **Wejście do kontenera backend**:

```bash
docker-compose exec backend bash
```

* **Wykonanie migracji**:

```bash
docker-compose exec backend python manage.py migrate
```

* **Utworzenie superusera**:

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Uwagi

* Frontend i backend są połączone z bazą danych PostgreSQL automatycznie przez Docker Compose.
* Porty lokalne (`5173` i `8080`) możesz zmienić w `docker-compose.yml` według potrzeb.
* **Migracje są obowiązkowe** przy pierwszym uruchomieniu backendu, aby wszystkie tabele w bazie danych zostały utworzone.
* Utworzenie superusera jest opcjonalne, ale zalecane w przypadku potrzeby pełnego dostępu administracyjnego.

```
Chcesz, żebym taką zrobił?
```
