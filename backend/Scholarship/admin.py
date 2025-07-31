from django.contrib import admin
from .models import Scholarship, Stage
from django.contrib import messages


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ['id', 'scholar_name', 'month_display', 'year', 'days', 'total_pay', 'release', 'status_display']
    list_filter = ['year', 'month', 'release', 'status']
    search_fields = ['scholar__name', 'year']
    ordering = ['-year', '-month']

    def save_model(self, request, obj, form, change):
        if obj.scholar.admission_category != "INST_FEL":
            self.message_user(
                request,
                "Only INST_FEL category scholars are eligible.",
                level=messages.ERROR
            )
            return  # Prevent save
        super().save_model(request, obj, form, change)
        
    def scholar_name(self, obj):
        return obj.scholar.name
    scholar_name.short_description = 'Scholar'

    def month_display(self, obj):
        return obj.get_month_display()
    month_display.short_description = 'Month'

    def status_display(self, obj):
        return dict(obj._meta.get_field('status').choices).get(obj.status, obj.status)
    status_display.short_description = 'Status'

@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ['id', 'scholarship_display', 'role_display', 'status_display', 'comments']
    list_filter = ['role', 'status']
    search_fields = ['scholarship__scholar__name']
    ordering = ['-id']

    def scholarship_display(self, obj):
        return str(obj.scholarship)
    scholarship_display.short_description = 'Scholarship'

    def role_display(self, obj):
        return dict(obj._meta.get_field('role').choices).get(obj.role, obj.role)
    role_display.short_description = 'Role'

    def status_display(self, obj):
        return dict(obj._meta.get_field('status').choices).get(obj.status, obj.status)
    status_display.short_description = 'Status'