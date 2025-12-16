# files/views.py

from rest_framework.decorators import api_view, permission_classes, parser_classes, authentication_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import File
from .serializers import FileSerializer
import boto3, os, io
import zipfile
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime
from django.conf import settings  # DODANY IMPORT DLA ŚCIEŻEK

# Import dla ReportLab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

# 🚨 DODANE IMPORTY DLA OBSŁUGI CZCIONEK TTF
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ===============================================================
# 🔥 NOWE IMPORTY MODELI Z BAZE DANYCH
# ===============================================================
try:
    from orders.models import Order
    from orderLog.models import OrderLog
except ImportError:
    class Order:
        STATUS_CHOICES = [('new', 'Nowe'), ('progress', 'W trakcie'), ('done', 'Zakończone')]
        objects = None

        def __init__(self):
            self.client = None
            self.manager = None
            self.title = "Dummy Order"
            self.description = "Dummy Description"
            self.created_at = datetime.now()
            self.updated_at = datetime.now()
            self.status = 'done'


    class OrderLog:
        EVENT_TYPES = [('status_change', 'Zmiana statusu'), ('file_added', 'Dodanie pliku')]
        objects = None

        @staticmethod
        def get_event_type_display(log):
            return dict(OrderLog.EVENT_TYPES).get(log.event_type, log.event_type)


    print(
        "WARNING: Order or OrderLog models could not be imported. PDF generation will rely on dummy classes.")
# ===============================================================

# --- Stałe konfiguracyjne R2 (bez zmian) ---
CLOUDFLARE_R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT")
CLOUDFLARE_R2_BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
CLOUDFLARE_R2_KEY = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
CLOUDFLARE_R2_SECRET = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
CLOUDFLARE_PUBLIC_URL = os.getenv("CLOUDFLARE_PUBLIC_URL")

# --- Stałe konfiguracyjne Firmy (Raport) ---
COMPANY_NAME = "ITFlow Sp. z o.o."
COMPANY_ADDRESS = "ul. Technologiczna 10, 00-001 Warszawa"
COMPANY_NIP = "123-456-78-90"
COMPANY_PHONE = "+48 123 456 789"

# ----------------------------------------------------
# 🚨 KONFIGURACJA CZCIONEK DLA POLSKICH ZNAKÓW
# ----------------------------------------------------
POLISH_FONT = 'DeJa'
POLISH_FONT_BOLD = 'DeJaBold'

try:
    # Używamy ścieżki względnej do bieżącego katalogu views.py, aby znaleźć pliki w files/fonts/
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Upewnij się, że pliki TTF mają poprawne nazwy
    font_normal_path = os.path.join(current_dir, 'fonts', 'DejaVuSans.ttf')
    font_bold_path = os.path.join(current_dir, 'fonts', 'DejaVuSans-Bold.ttf')

    # Sprawdzenie istnienia plików i rejestracja
    if os.path.exists(font_normal_path) and os.path.exists(font_bold_path):
        pdfmetrics.registerFont(TTFont(POLISH_FONT, font_normal_path))
        pdfmetrics.registerFont(TTFont(POLISH_FONT_BOLD, font_bold_path))

        pdfmetrics.registerFontFamily(POLISH_FONT, normal=POLISH_FONT, bold=POLISH_FONT_BOLD)

        DEFAULT_FONT = POLISH_FONT
        DEFAULT_FONT_BOLD = POLISH_FONT_BOLD
        print("INFO: Polskie czcionki TTF zarejestrowane pomyślnie.")
    else:
        # Fallback, jeśli pliki TTF nie zostały znalezione
        # BARDZO WAŻNE: W tym miejscu musisz sprawdzić, czy pliki na pewno są we właściwej lokalizacji
        raise FileNotFoundError("Brak plików czcionek TTF w files/fonts/ - upewnij się, że są tam 'DejaVuSans.ttf' i 'DejaVuSans-Bold.ttf'.")

except Exception as e:
    print(f"OSTRZEŻENIE: Błąd rejestracji czcionek: {e}. Używane są domyślne ReportLabowe (bez polskich znaków).")
    DEFAULT_FONT = 'Helvetica'
    DEFAULT_FONT_BOLD = 'Helvetica-Bold'


# ----------------------------------------------------


# Inicjalizacja klienta S3 dla Cloudflare R2 (bez zmian)
def get_r2_client():
    session = boto3.session.Session()
    return session.client(
        's3',
        endpoint_url=CLOUDFLARE_R2_ENDPOINT,
        aws_access_key_id=CLOUDFLARE_R2_KEY,
        aws_secret_access_key=CLOUDFLARE_R2_SECRET
    )


def upload_to_r2(file_obj):
    s3 = get_r2_client()
    # 🚨 POPRAWKA: Dodanie timestampu do nazwy pliku, aby uniknąć kolizji i bezpieczne nazewnictwo.
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    file_key = f"uploads/{timestamp}_{os.path.basename(file_obj.name)}"

    try:
        s3.upload_fileobj(file_obj, CLOUDFLARE_R2_BUCKET, file_key)
        # POPRAWKA: Upewnij się, że zwracany URL jest poprawny
        return f"{CLOUDFLARE_PUBLIC_URL.rstrip('/')}/{file_key}"
    except Exception as e:
        print(f"Błąd podczas ładowania pliku do R2: {e}")
        # RZUCAMY BŁĄD, ABY MÓC GO ZŁAPAĆ W upload_file_api
        raise


# --- Pozostałe funkcje API (bez zmian) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_list_api(request):
    user = request.user
    queryset = File.objects.all()
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)
    serializer = FileSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_by_order_api(request, order_id):
    user = request.user
    queryset = File.objects.filter(order_id=order_id)
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)
    serializer = FileSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file_api(request):
    uploaded_file = request.FILES.get('uploaded_file')
    if not uploaded_file:
        return Response({"uploaded_file": "This field is required."}, status=400)

    try:
        # 🚨 POPRAWKA: Łapanie błędu z upload_to_r2
        cloud_url = upload_to_r2(uploaded_file)
    except Exception as e:
        return Response({"detail": f"Błąd podczas ładowania pliku do R2: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    data = {
        # 🚨 POPRAWKA: Używamy uploaded_file.name jako domyślnej nazwy
        'name': request.data.get('name', uploaded_file.name),
        'file_type': request.data.get('file_type'),
        'description': request.data.get('description'),
        'order': request.data.get('order'),
        'visible_to_clients': request.data.get('visible_to_clients') in ['True', 'true', '1', True],
        'uploaded_file_url': cloud_url,
        'uploaded_by': request.user.id
    }

    serializer = FileSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_detail_api(request, pk):
    try:
        file_obj = File.objects.get(pk=pk)
    except File.DoesNotExist:
        return Response({"detail": "Nie znaleziono pliku."}, status=404)

    user = request.user
    if user.groups.filter(name='Client').exists() and not file_obj.visible_to_clients:
        return Response({"detail": "Brak dostępu."}, status=403)

    serializer = FileSerializer(file_obj, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_visible_to_clients_api(request, pk):
    try:
        file_obj = File.objects.get(pk=pk)
    except File.DoesNotExist:
        return Response({"detail": "Plik nie istnieje."}, status=404)

    visible = request.data.get("visible_to_clients")
    if visible is None:
        return Response({"visible_to_clients": "This field is required."}, status=400)

    if isinstance(visible, str):
        visible = visible.lower() in ('true', '1')
    elif isinstance(visible, int):
        visible = visible == 1

    file_obj.visible_to_clients = bool(visible)
    file_obj.save()
    return Response({"detail": "Zmieniono widoczność.", "visible_to_clients": file_obj.visible_to_clients}, status=200)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_files_api(request, order_id):
    user = request.user
    # ... (kod funkcji download_files_api) ...
    file_ids_str = request.query_params.get('file_ids')
    if not file_ids_str:
        return Response({'detail': 'Wymagany parametr file_ids.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_ids = [int(id_str.strip()) for id_str in file_ids_str.split(',')]
    except ValueError:
        return Response({'detail': 'Nieprawidłowy format file_ids.'}, status=status.HTTP_400_BAD_REQUEST)

    queryset = File.objects.filter(id__in=file_ids, order_id=order_id)
    is_client = user.groups.filter(name='Client').exists()

    if is_client:
        queryset = queryset.filter(visible_to_clients=True)

    if not queryset.exists():
        return Response({'detail': 'Nie znaleziono plików do pobrania lub brak uprawnień.'},
                        status=status.HTTP_404_NOT_FOUND)

    s3 = get_r2_client()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in queryset:
            try:
                file_key_path = file_obj.uploaded_file_url.replace(f"{CLOUDFLARE_PUBLIC_URL.rstrip('/')}/", '')
                r2_object = s3.get_object(Bucket=CLOUDFLARE_R2_BUCKET, Key=file_key_path)
                file_content = r2_object['Body'].read()

                filename = f"{file_obj.name}.{file_obj.file_type}" if file_obj.file_type else file_obj.name
                zip_file.writestr(filename, file_content)

            except Exception as e:
                print(f"Błąd pobierania pliku {file_obj.name} z R2: {e}")

    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="order_{order_id}_files.zip"'
    response['Content-Length'] = zip_buffer.tell()

    return response


# ---------------------------------------------------------------------------------------------------
# FUNKCJA GENERUJĄCA RAPORT PDF (ZAKTUALIZOWANA Z OBSŁUGĄ CZCIONEK TTF I POPRAWIONĄ LOGIKĄ PODPISU)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_final_report_pdf_api(request, order_id):
    """
    Generuje i zwraca raport końcowy w formacie PDF dla danego zamówienia.
    Dane są pobierane z modelu Order i OrderLog.
    """
    user = request.user

    # 1. Walidacja i pobranie obiektu Order
    order = get_object_or_404(Order, pk=order_id)

    # 2. Walidacja dostępu
    is_manager_or_dev = user.groups.filter(Q(name='Manager') | Q(name='Developer')).exists()
    is_client_of_order = order.client == user

    if not (is_manager_or_dev or is_client_of_order):
        return Response({'detail': 'Brak uprawnień do pobrania raportu dla tego zlecenia.'},
                        status=status.HTTP_403_FORBIDDEN)

    # 3. Pobranie Historii (OrderLog)
    if hasattr(order, 'history'):
        history_logs = order.history.select_related('actor', 'file').order_by('timestamp').all()
    else:
        try:
            history_logs = OrderLog.objects.filter(order=order).select_related('actor', 'file').order_by(
                'timestamp').all()
        except AttributeError:
            history_logs = []

    # 4. Logika generowania PDF
    pdf_buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=4 * cm,
        bottomMargin=2 * cm
    )
    width, height = A4

    story = []

    styles = getSampleStyleSheet()

    # ZMIENIONE: Wzmocnienie stylów przez nadpisanie standardowych
    styles['Normal'].fontName = DEFAULT_FONT
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 14
    styles['Heading1'].fontName = DEFAULT_FONT_BOLD
    styles['Heading1'].fontSize = 18
    styles['Heading2'].fontName = DEFAULT_FONT_BOLD
    styles['Heading2'].fontSize = 14

    # Definicja niestandardowych stylów
    styles.add(ParagraphStyle(name='ReportTitle', fontName=DEFAULT_FONT_BOLD, fontSize=20, spaceAfter=20, alignment=1))
    styles.add(ParagraphStyle(name='Head2', fontName=DEFAULT_FONT_BOLD, fontSize=14, spaceBefore=15, spaceAfter=10))
    styles.add(ParagraphStyle(name='Body', fontName=DEFAULT_FONT, fontSize=10, leading=14))
    styles.add(ParagraphStyle(name='BodyBold', fontName=DEFAULT_FONT_BOLD, fontSize=10, leading=14))
    styles.add(ParagraphStyle(name='HistoryItem', fontName=DEFAULT_FONT, fontSize=9, leading=12, leftIndent=0.5 * cm,
                              spaceBefore=3))
    styles.add(ParagraphStyle(name='Footer', fontName=DEFAULT_FONT, fontSize=9, textColor=colors.grey, alignment=1,
                              spaceBefore=50))
    # Styl podpisu
    styles.add(ParagraphStyle(name='SignatureLine', fontName=DEFAULT_FONT, fontSize=10, alignment=2, spaceBefore=10))

    # ----------------------------------
    # --- NAGŁÓWEK (Element statyczny - użyj metody onFirstPage / onLaterPages)
    # ----------------------------------

    def header_footer(canvas, doc):
        canvas.saveState()

        # Nagłówek (Dane firmy)
        canvas.setFont(DEFAULT_FONT_BOLD, 10)
        canvas.drawString(width - 7 * cm, height - 2 * cm, COMPANY_NAME)
        canvas.setFont(DEFAULT_FONT, 9)
        canvas.drawString(width - 7 * cm, height - 2.5 * cm, COMPANY_ADDRESS)
        canvas.drawString(width - 7 * cm, height - 2.9 * cm, f"NIP: {COMPANY_NIP} | Tel: {COMPANY_PHONE}")

        # Stopka
        footer_text = f"Raport Końcowy Zlecenia #{order.pk} | {COMPANY_NAME} | Strona {canvas.getPageNumber()}"
        canvas.drawCentredString(width / 2, 1.5 * cm, footer_text)

        canvas.restoreState()

    # ----------------------------------
    # --- TREŚĆ RAPORTU (Flowables) ---
    # ----------------------------------

    # --- TYTUŁ RAPORTU ---
    story.append(Paragraph(f"RAPORT KOŃCOWY ZLECENIA #{order.pk}", styles['ReportTitle']))

    # DODANY SPACER, ABY TYTUŁ NIE ZACZYNAŁ SIĘ ZBYT BLISKO NAGŁÓWKA
    story.append(Spacer(1, 1 * cm))

    # --- SEKCJA: DANE ZLECENIA (Tabela) ---
    story.append(Paragraph("1. Kluczowe Informacje o Zleceniu", styles['Head2']))

    status_display = dict(Order.STATUS_CHOICES).get(order.status, order.status)
    finished_at = order.updated_at if order.status == 'done' else None

    # Poprawna nazwa Managera do użycia w raporcie
    manager_name = order.manager.get_full_name() if order.manager else "Nieprzypisany"

    data = [
        [Paragraph(f"<b>Nazwa Zlecenia:</b>", styles['Body']), order.title],
        [Paragraph(f"<b>Klient:</b>", styles['Body']), order.client.get_full_name() or order.client.username],
        [Paragraph(f"<b>Manager:</b>", styles['Body']), manager_name],
        [Paragraph(f"<b>Status Końcowy:</b>", styles['Body']), status_display],
        [Paragraph(f"<b>Data Zgłoszenia:</b>", styles['Body']), order.created_at.strftime('%Y-%m-%d %H:%M')],
    ]
    if finished_at:
        data.append([Paragraph(f"<b>Data Zakończenia:</b>", styles['Body']), finished_at.strftime('%Y-%m-%d %H:%M')])

    table = Table(data, colWidths=[4 * cm, None])
    table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),
        # Użycie zdefiniowanych czcionek dla tabeli
        ('FONTNAME', (0, 0), (0, -1), DEFAULT_FONT_BOLD),
        ('FONTNAME', (1, 0), (-1, -1), DEFAULT_FONT),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(table)
    story.append(Spacer(1, 1 * cm))

    # --- SEKCJA: OPIS ZLECENIA ---
    story.append(Paragraph("2. Opis Zlecenia", styles['Head2']))

    desc_text = Paragraph(order.description.replace('\n', '<br/>'), styles['Body'])
    story.append(desc_text)
    story.append(Spacer(1, 1 * cm))

    # --- SEKCJA: HISTORIA ZDARZEŃ (ORDER LOG) ---
    story.append(Paragraph("3. Pełna Historia Zdarzeń", styles['Head2']))

    if not history_logs:
        story.append(Paragraph("Brak zapisanych zdarzeń w historii zlecenia.", styles['Body']))
        story.append(Spacer(1, 1 * cm))
    else:
        for log in history_logs:
            actor_name = log.actor.get_full_name() or log.actor.username if log.actor else 'System'
            timestamp_str = log.timestamp.strftime('%Y-%m-%d %H:%M')

            if hasattr(log, 'get_event_type_display'):
                event_display = log.get_event_type_display()
            else:
                event_display = log.event_type

            # Formatowanie opisu - używamy tagu <font name='...'> do poprawnej obsługi czcionek w Paragraph
            description_html = f"<font name='{DEFAULT_FONT_BOLD}'>[{timestamp_str}]</font> ({actor_name}, {event_display}): {log.description or 'Brak opisu.'}"

            if log.event_type == 'status_change' and log.old_value and log.new_value:
                old_display = dict(Order.STATUS_CHOICES).get(log.old_value, log.old_value)
                new_display = dict(Order.STATUS_CHOICES).get(log.new_value, log.new_value)
                # Używamy tagów <font name='...'> wewnątrz, aby poprawnie renderować znaki specjalne
                description_html += f" (Status: <font name='{DEFAULT_FONT}' color='gray'>{old_display}</font> &rarr; <font name='{DEFAULT_FONT_BOLD}' color='green'>{new_display}</font>)"

            if log.event_type == 'file_added' and log.file:
                description_html += f" (Plik: <font name='{DEFAULT_FONT_BOLD}'><u>{log.file.name}.{log.file.file_type or 'Brak typu'}</u></font>)"

            history_para = Paragraph(description_html, styles['HistoryItem'])
            story.append(history_para)

        story.append(Spacer(1, 1 * cm))

    # --- SEKCJA: PODSUMOWANIE (Jako wniosek końcowy) ---
    story.append(Paragraph("4. Podsumowanie Końcowe i Podziękowanie", styles['Head2']))

    final_summary = (
        "Projekt został pomyślnie zakończony zgodnie z ustalonymi celami i terminami. "
        "Wszystkie zgłoszone wymagania funkcjonalne zostały spełnione, a system przeszedł pomyślnie końcowe testy akceptacyjne. "
        "Niniejszy raport stanowi formalne zamknięcie zlecenia."
    )

    summary_text = Paragraph(final_summary, styles['Body'])
    story.append(summary_text)
    story.append(Spacer(1, 1.5 * cm))

    # Podziękowanie
    story.append(Paragraph(
        f"<font name='{DEFAULT_FONT_BOLD}'>Dziękujemy za zaufanie, jakim obdarzyli Państwo firmę ITFlow Sp. z o.o.!</font>",
        styles['BodyBold']))
    story.append(Paragraph("Mamy nadzieję na dalszą owocną współpracę.", styles['Body']))
    story.append(Spacer(1, 3 * cm))  # Większy odstęp przed sekcją podpisu

    # ----------------------------------
    # --- SEKCJA: PODPIS (Manager) ---
    # ----------------------------------

    # 🚨 ZMIENIONE: Podpis Managera zlecenia
    signature_name = manager_name if order.manager else "Brak przypisanego Managera"

    # Używamy stylów z wyrównaniem do prawej (alignment=2)
    # Linia podpisu (wyrównanie do prawej)
    story.append(Paragraph("<hr width='50%' align='right' noshade='noshade'/>", styles['Normal']))

    # Imię i nazwisko Managera
    story.append(Paragraph(f"({signature_name})", styles['SignatureLine']))

    # Opis podpisu
    story.append(Paragraph("Podpis Managera Zlecenia", styles['SignatureLine']))

    # 5. Budowanie dokumentu
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)

    pdf_content = pdf_buffer.getvalue()
    pdf_buffer.close()

    # 6. Przygotowanie odpowiedzi HTTP
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Raport_Koncowy_Zamowienia_{order_id}.pdf"'
    response['Content-Length'] = len(pdf_content)

    return response