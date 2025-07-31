from django.contrib import admin
from .models import Faculty, Roles, Student

# Inline Roles for Faculty
class RoleInline(admin.TabularInline):
    model = Roles
    extra = 0

# Faculty Admin
@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'department', 'designation', 'university', 'type_of_employee')
    list_filter = ('department', 'designation', 'university', 'type_of_employee')
    search_fields = ('name', 'email', 'department', 'university')
    ordering = ('name',)

    autocomplete_fields = ['user']
    readonly_fields = ['profile_pic_preview']
    inlines = [RoleInline]

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'email', 'phone_number', 'profile_pic', 'profile_pic_preview', 'date_of_birth')
        }),
        ('Academic Info', {
            'fields': ('department', 'university', 'designation', 'type_of_employee', 'nature_of_employment')
        }),
        ('Address', {
            'fields': ('address',)
        }),
    )

    def profile_pic_preview(self, obj):
        if obj.profile_pic:
            return f'<img src="{obj.profile_pic.url}" width="100" />'
        return "No image"
    profile_pic_preview.allow_tags = True
    profile_pic_preview.short_description = "Profile Preview"

# Roles Admin
@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    list_display = ('faculty', 'role')
    list_filter = ('role',)
    search_fields = ('faculty__name', 'role')
    ordering = ('faculty__name',)
    autocomplete_fields = ['faculty']

# Student Admin
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'enroll', 'registration', 'department', 'course', 'supervisor_name', 'gender')
    list_filter = ('department', 'course', 'gender')
    search_fields = ('name', 'email', 'enroll', 'registration', 'supervisor__name')
    ordering = ('name',)

    autocomplete_fields = ['user', 'supervisor', 'co_supervisor']
    readonly_fields = ['profile_pic_preview']

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'email', 'phone_number', 'profile_pic', 'profile_pic_preview')
        }),
        ('Academic Info', {
            'fields': ('enroll', 'registration', 'department', 'course', 'university', 'joining_date')
        }),
        ('Supervision', {
            'fields': ('supervisor', 'co_supervisor')
        }),
        ('Scholarship Info', {
            'fields': ('scholarship_basic', 'scholarship_hra')
        }),
        ('Address', {
            'fields': ('present_address', 'current_address')
        }),
        ('Personal Info', {
            'fields': ('gender', 'account_no', 'ifsc', 'admission_category', 'type_of_work', 'rf_category')
        }),
    )

    def profile_pic_preview(self, obj):
        if obj.profile_pic:
            return f'<img src="{obj.profile_pic.url}" width="100" />'
        return "No image"
    profile_pic_preview.allow_tags = True
    profile_pic_preview.short_description = "Profile Preview"

    def supervisor_name(self, obj):
        return obj.supervisor.name if obj.supervisor else "No supervisor"
    supervisor_name.short_description = 'Supervisor'
