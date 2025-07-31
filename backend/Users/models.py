from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPARTMENT_JSON_PATH = os.path.join(BASE_DIR, 'conf.json')

try:
    with open(DEPARTMENT_JSON_PATH, 'r') as file:
        config = json.load(file)

    college_data = config.get('college', {})
    toe = config.get('type_of_employee', {})
    tow = config.get('type_of_work', {})
    designation = config.get('designation', {})
    noe = config.get('nature_of_employment', {})
    ac = config.get('admission_category', {})
    gender = config.get('gender', {})
    rc = config.get('research_category', {})

    departments = college_data.get('departments', {})
    roles = college_data.get('roles', {})
    universities = college_data.get('university', {})

    DEPARTMENT_CHOICES = [(key, value) for key, value in departments.items()]
    TOE = [(key, value) for key, value in toe.items()]
    TOW = [(key, value) for key, value in tow.items()]
    NOE = [(key, value) for key, value in noe.items()]
    RC = [(key, value) for key, value in rc.items()]
    GENDER = [(key, value) for key, value in gender.items()]
    DESIGNATION = [(key, value) for key, value in designation.items()]
    ROLES = [(key, value) for key, value in roles.items()]
    UNIVERSITIES = [(key, value) for key, value in universities.items()]
    AC = [(key, value) for key, value in ac.items()]

except Exception as e:
    print(f"Error loading: {e}")
    DEPARTMENT_CHOICES = []
    ROLES = []
    TOE = []
    RC = []
    TOW = []
    AC = []
    NOE = []
    DESIGNATION = []
    UNIVERSITIES = []
    GENDER = []



class Faculty(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)
    department = models.CharField(max_length=255, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    university = models.CharField(max_length=255,choices=UNIVERSITIES)
    designation = models.CharField(max_length=255,choices=DESIGNATION)
    profile_pic = models.ImageField(upload_to='faculty/profile_pics/', null=True, blank=True)
    date_of_birth=models.DateField()
    type_of_employee=models.CharField(max_length=255,default='T',choices=TOE)
    nature_of_employment=models.CharField(max_length=255,default='PERM',choices=NOE)
    address=models.TextField(max_length=1023,null=True,blank=True)

    def __str__(self):
        return f"{self.name}"

class Roles(models.Model):
    faculty=models.ForeignKey(Faculty,on_delete=models.CASCADE)
    role=models.CharField(max_length=255,choices=ROLES)

class Student(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    enroll=models.CharField(max_length=255,unique=True)
    registration=models.CharField(max_length=255,unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    department = models.CharField(max_length=255, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    course = models.CharField(max_length=255)
    university = models.CharField(max_length=255,choices=UNIVERSITIES)
    joining_date = models.DateField(default=timezone.now)
    supervisor = models.ForeignKey(Faculty, on_delete=models.SET_NULL,null=True, blank=True,related_name="Supervisor")
    co_supervisor = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True,related_name="CO_Supervisor")
    scholarship_basic = models.DecimalField(max_digits=10, decimal_places=2, default=37000)
    scholarship_hra = models.DecimalField(max_digits=5, decimal_places=2, default=0.18)
    profile_pic = models.ImageField(upload_to='student/profile_pics/', null=True, blank=True)
    present_address=models.TextField(max_length=1023,null=True,blank=True)
    current_address=models.TextField(max_length=1023,null=True,blank=True)
    gender = models.CharField(max_length=32,default='M',choices=GENDER)
    account_no = models.CharField(max_length=30,null=True,blank=True)
    ifsc = models.CharField(max_length=255,null=True,blank=True)
    admission_category=models.CharField(max_length=255,choices=AC)
    type_of_work=models.CharField(max_length=255,choices=TOW,default="FT")
    rf_category=models.CharField(max_length=31,choices=RC,default="JRF")
    
    def save(self, *args, **kwargs):
        if self.admission_category != "INST_FEL":
            self.scholarship_basic = 0
            self.scholarship_hra = 0
        elif self.rf_category == "SRF":
            self.scholarship_basic = 42000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"
    
