import os
import json
import logging
import pandas as pd
import re

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

from Users.models import Faculty, Student

logger = logging.getLogger(__name__)

# Load configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CONFIG_PATH = os.path.join(BASE_DIR, 'conf.json')

with open(CONFIG_PATH, 'r') as file:
    config = json.load(file)

# Mappings
college_data = config.get('college', {})
toe_map = config.get('type_of_employee', {})
tow_map = config.get('type_of_work', {})
designation_map = config.get('designation', {})
noe_map = config.get('nature_of_employment', {})
ac_map = config.get('admission_category', {})
gender_map = config.get('gender', {})
rc_map = config.get('research_category', {})

departments_map = college_data.get('departments', {})
roles_map = college_data.get('roles', {})
universities_map = college_data.get('university', {})


def reverse_lookup(mapping: dict, value: str):
    value = str(value).strip().lower()
    return next((k for k, v in mapping.items() if v.strip().lower() == value), None)


class Command(BaseCommand):
    help = 'Import students from Excel file into the Student model'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        try:
            file_path = os.path.join(BASE_DIR, 'scripts', 'scholar.xlsx')
            if not os.path.exists(file_path):
                self.stdout.write(self.style.ERROR(f"Excel file not found at {file_path}"))
                return

            df = pd.read_excel(file_path)
            df.columns = df.columns.str.strip()
            df["Supervisor"] = df["Supervisor"].astype(str).str.replace("Prof ", "", regex=False).str.strip()
            df["Co-supervisor"] = df["Co-supervisor"].astype(str).str.replace("Prof ", "", regex=False).str.strip()

            duplicates = df[df.duplicated(subset=["Registration No"], keep=False)]
            if not duplicates.empty:
                self.stdout.write(self.style.WARNING("Duplicate registration numbers found in the Excel file:"))
                self.stdout.write(str(duplicates[["Registration No", "Name of the Research Scholar"]]))

            users_to_create = []
            students_to_create = []
            usernames_seen = set()
            

            for index, row in df.iterrows():
                try:
                    name = str(row.get("Name of the Research Scholar", '')).strip()
                    registration = str(row.get("Registration No", '')).strip()
                    enrollment = str(row.get("Enrolment No.", '')).strip()
                    rf_category = str(row.get("JRF/SRF", '')).strip()
                    email = f"{enrollment.lower()}@example.com"
                    username = enrollment.lower()
                    hashed_password = make_password(username)

                    if not name or not registration or not enrollment:
                        self.stdout.write(self.style.WARNING(f"Skipping row {index} due to missing essential data."))
                        continue

                    if username in usernames_seen or User.objects.filter(username=username).exists():
                        self.stdout.write(self.style.WARNING(f"Duplicate username/email detected: {username}"))
                        continue

                    usernames_seen.add(username)

                    department = reverse_lookup(departments_map, row.get("Department", '')) or "UNKNOWN"
                    gender = reverse_lookup(gender_map, row.get("Gender", '')) or "U"
                    admission_category = reverse_lookup(ac_map, row.get("Admission Category", '')) or "OTH"
                    work_type = reverse_lookup(tow_map, row.get("Full Time/Part Time", '')) or "Unknown"

                    joining_date_raw = pd.to_datetime(row.get("Date of Joining", timezone.now()), errors='coerce')
                    if pd.isna(joining_date_raw):
                        logger.warning(f"Invalid joining date for {name} at row {index}. Defaulting to 1970-01-01.")
                        joining_date = pd.to_datetime("1970-01-01").date()
                    else:
                        joining_date = joining_date_raw.date()

                    supervisor_name = str(row.get("Supervisor", '')).strip()
                    co_supervisor_name = str(row.get("Co-supervisor", '')).strip()
                    mobile = str(row.get("Contact Number", '')).strip()
                    mail = str(row.get("Mail ID", '')).strip()
                    mail = re.sub(r'\s+', ' ', mail)

                    # Match Supervisor
                    supervisor = Faculty.objects.filter(name__iexact=supervisor_name).first()
                    if not supervisor and supervisor_name:
                        surname = supervisor_name.split()[-1]
                        supervisor = Faculty.objects.filter(name__icontains=surname, department__iexact=department).first()

                    # Match Co-supervisor
                    co_supervisor = None
                    if co_supervisor_name and co_supervisor_name.lower() != "nan":
                        co_supervisor = Faculty.objects.filter(name__iexact=co_supervisor_name).first()
                        if not co_supervisor:
                            co_surname = co_supervisor_name.split()[-1]
                            co_supervisor = Faculty.objects.filter(name__icontains=co_surname, department__iexact=department).first()

                    user = User(
                        username=username,
                        email=email,
                        password=hashed_password,
                        first_name=name.split()[0]
                    )
                    student = Student(
                        user=user,
                        name=name,
                        registration=registration,
                        enroll=enrollment,
                        rf_category=rf_category,
                        department=department.upper(),
                        gender=gender.upper(),
                        course="PhD",
                        university="NIT-Sri",
                        joining_date=joining_date,
                        supervisor=supervisor,
                        co_supervisor=co_supervisor,
                        admission_category=admission_category,
                        type_of_work=work_type,
                        email=mail,
                        phone_number=mobile
                    )

                    users_to_create.append(user)
                    students_to_create.append(student)

                except Exception as row_error:
                    self.stdout.write(self.style.ERROR(f"Error processing row {index}: {row_error}"))
                    logger.exception(f"Row {index} error: {row.to_dict()}")

            # Save all users and students atomically
            with transaction.atomic():
                User.objects.bulk_create(users_to_create)
                for student, user in zip(students_to_create, users_to_create):
                    student.user = user
                for student in students_to_create:
                    if student.admission_category != "INST_FEL":
                        student.scholarship_basic = 0
                        student.scholarship_hra = 0
                Student.objects.bulk_create(students_to_create)

            self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(students_to_create)} students."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Import failed: {e}"))
            logger.exception("Failed during student import")
