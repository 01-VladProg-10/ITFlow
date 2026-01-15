from django.contrib import admin
from .models import OrderLog


@admin.register(OrderLog)
class OrderLogAdmin(admin.ModelAdmin):
    list_display = (
        "timestamp",
        "order",
        "actor",
        "event_type",
        "old_value",
        "new_value",
        "file"
    )
    list_filter = ("event_type", "timestamp", "actor")
    search_fields = ("description", "old_value", "new_value", "order__title")
    ordering = ("-timestamp",)

    readonly_fields = ("timestamp",)

    fieldsets = (
        ("Informacje podstawowe", {
            "fields": ("order", "actor", "event_type")
        }),
        ("Szczegóły", {
            "fields": ("description", "old_value", "new_value", "file")
        }),
        ("System", {
            "fields": ("timestamp",),
        }),
    )