# Używamy oficjalnego obrazu Pythona
FROM python:3.11

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy plik z zależnościami
COPY requirements.txt .

# Instalujemy zależności
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy cały projekt do kontenera
COPY .. .

# Ustawienie zmiennej środowiskowej dla czytelnych logów
ENV PYTHONUNBUFFERED=1

# Otwieramy port, na którym działa Django
EXPOSE 8080

# Komenda startowa (dev server)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]