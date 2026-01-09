from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'client', 'manager', 'developer', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description')
    autocomplete_fields = ('client', 'manager', 'developer')
    ordering = ('-created_at',)