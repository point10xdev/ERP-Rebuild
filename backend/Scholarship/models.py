from django.db import models
from calendar import monthrange
from datetime import date
from Users.models import Student  
import json
import os
    
from django.core.exceptions import ValidationError
from calendar import monthrange


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPARTMENT_JSON_PATH = os.path.join(BASE_DIR, 'conf.json')

try:
    if not os.path.exists(DEPARTMENT_JSON_PATH) or os.stat(DEPARTMENT_JSON_PATH).st_size == 0:
        raise Exception("JSON file does not exist or is empty.")
    with open(DEPARTMENT_JSON_PATH, 'r') as file:
        data = json.load(file)
        college_data = data.get('college', {})
        status = data.get('status', {})
        departments = college_data.get('departments', {})
        roles = college_data.get('roles', {})
        STATUS=[(key, value) for key, value in status.items()]
        DEPARTMENT_CHOICES = [(key, value) for key, value in departments.items()]
        ROLES = [(key, value) for key, value in roles.items()]
except Exception as e:
    print(f"Error loading: {e}")
    DEPARTMENT_CHOICES = []
    ROLES = []
    STATUS=[]
    
    


class Scholarship(models.Model):
    scholar = models.ForeignKey(Student, on_delete=models.CASCADE)
    month = models.IntegerField(choices=[(i, date(2000, i, 1).strftime('%B')) for i in range(1, 13)])
    year = models.IntegerField()
    days = models.IntegerField(editable=True)
    total_pay = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    total_pay_per_day = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    release = models.BooleanField(default=False)
    status = models.CharField(max_length=255, choices=STATUS, default="2")

    def save(self, *args, **kwargs):
        if self.scholar.admission_category != "INST_FEL":
            raise ValidationError("Scholarship can only be created for INST_FEL category students.")
        
        if not self.days:
            self.days = monthrange(self.year, self.month)[1]
        basic = self.scholar.scholarship_basic
        hra = self.scholar.scholarship_hra
        days_in_month = monthrange(self.year, self.month)[1]
        self.total_pay_per_day = (basic + (basic * hra)) / days_in_month
        self.total_pay = self.days * self.total_pay_per_day

        # is_new = self.pk is None
        super().save(*args, **kwargs)

        # if is_new:
        #     Stage.objects.create(scholarship=self)

    def __str__(self):
        return f"Scholarship for {self.scholar.name} - {self.get_month_display()} {self.year}"

class Stage(models.Model):
    scholarship=models.ForeignKey(Scholarship,on_delete=models.CASCADE)
    role=models.CharField(max_length=255,choices=ROLES)
    status=models.CharField(max_length=255,choices=STATUS,default=2)
    comments=models.TextField(max_length=1023,null=True,blank=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['scholarship', 'role', 'status'], name='unique_scholarship_role_status')
        ]
