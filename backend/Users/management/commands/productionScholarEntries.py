import pandas as pd
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from Users.models import Faculty, Student
import os
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import students from Excel file into Student model'

    def handle(self, *args, **kwargs):
        try:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            file_path = os.path.join(BASE_DIR, 'media/Users/scholar.xlsx')
            df = pd.read_excel(file_path)

            df["Supervisor"] = df["Supervisor"].astype(str).str.replace("Prof ", "", regex=False).str.strip()
            df["Co-supervisor"] = df["Co-supervisor"].astype(str).str.replace("Prof ", "", regex=False).str.strip()
            df.columns = df.columns.str.strip()

            users_to_create = []
            students_to_create = []
            usernames_seen = set()
            hashed_password=make_password("root")
            for _, row in df.iterrows():

                name = row.get("Student's Name", '').strip()
                registration = str(row.get("Registration No", '')).strip()
                enrollment = str(row.get("Enrolment No", '')).strip()
                department = str(row.get("Department", '')).strip()
                gender = str(row.get("Gender", '')).strip().upper()
                batch = row.get("Batch", '')
                joining_date_raw = pd.to_datetime(row.get("Date of Joining", timezone.now())).date()
                joining_date_parsed = pd.to_datetime(joining_date_raw, errors='coerce')
                joining_date = joining_date_parsed.date() if pd.notna(joining_date_parsed) else pd.to_datetime("1970-01-01").date()
                admission_category = str(row.get("Admission Category", '')).strip()
                work_type = str(row.get("Full Time/Part Time", '')).strip().title()
                supervisor_name = str(row.get("Supervisor", '')).strip()
                co_supervisor_name = str(row.get("Co-supervisor", '')).strip()

                username = enrollment.lower()

                if not name or not registration or not enrollment:
                    raise ValueError(f"Missing essential fields in row: {row.to_dict()}")

                if username in usernames_seen or User.objects.filter(username=username).exists():
                    raise ValueError(f"Duplicate username/email: {username}")
                usernames_seen.add(username)

                user = User(username=username, email=f"{username}@example.com",password=hashed_password, first_name=name.split()[0])
                users_to_create.append(user)

                supervisor = Faculty.objects.filter(name__iexact=supervisor_name).first() if supervisor_name else None
                if supervisor_name and not supervisor:
                    surname = supervisor_name.strip().split()[-1]
                    fallback_supervisor = Faculty.objects.filter(name__icontains=surname, department__iexact=department).first()
                    if fallback_supervisor:
                        supervisor = fallback_supervisor

                co_supervisor = Faculty.objects.filter(name__iexact=co_supervisor_name).first() if co_supervisor_name else None

                student = Student(
                    name=name,
                    registration=registration,
                    enroll=enrollment,
                    department=department.upper(),
                    gender=gender,
                    course="PhD",
                    university="NIT-Sri",
                    joining_date=joining_date,
                    supervisor=supervisor,
                    co_supervisor=co_supervisor,
                    admission_category=admission_category,
                    type_of_work=work_type,
                )
                students_to_create.append(student)
                print(f"{name} added:")
            # Second stage: Save to DB only if all above succeeded
            
            with transaction.atomic():
                User.objects.bulk_create(users_to_create)
                for student, user in zip(students_to_create, users_to_create):
                    student.user = user
                Student.objects.bulk_create(students_to_create)


        except Exception as e:
            logger.error(f"Import failed: {e}")
