import os
import json
import pandas as pd
import logging
import re

from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

from Users.models import Faculty, Roles

# Setup logger
logger = logging.getLogger(__name__)

# Load config
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CONFIG_PATH = os.path.join(BASE_DIR, 'conf.json')

with open(CONFIG_PATH, 'r') as file:
    config = json.load(file)

# Mappings
college_data = config.get('college', {})
toe_map = config.get('type_of_employee', {})
noe_map = config.get('nature_of_employment', {})
designation_map = config.get('designation', {})
departments_map = college_data.get('departments', {})

HOD_EMAILS = {
    "mfwani@nitsri.ac.in",
    "gausia.qazi@nitsri.ac.in",
    "mdmufti@nitsri.ac.in",
    "bhat_javed@nitsri.ac.in", 
    "mirfasil@nitsri.ac.in",
    "shaima@nitsri.ac.in",
    "zjabeen19@yahoo.com",
    "shabir@nitsri.ac.in",
    "jayashrivastava@nitsri.ac.in",
    "ikram@nitsri.ac.in",
    "irfansamad@nitsri.ac.in"
    #Chemistry Kausar Maam
}

def reverse_lookup(mapping: dict, value: str):
    if not value:
        return None
    value = str(value).strip().lower()
    return next((k for k, v in mapping.items() if v.strip().lower() == value), None)

class Command(BaseCommand):
    help = 'Create Faculty entries from employee Excel file and a default admin user'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        try:
            # Create superuser
            username = 'admin'
            password = 'root'
            email = 'admin@example.com'

            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(username=username, password=password, email=email)
                self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully."))
            else:
                self.stdout.write(self.style.WARNING(f"Superuser '{username}' already exists."))

            # Load Excel
            excel_path = os.path.join(BASE_DIR, 'scripts', 'employee.xlsx')
            df = pd.read_excel(excel_path)

            users = []
            faculties = []
            usernames_seen = set()
            

            user_map = {}
            faculty_map = {}

            for idx, row in df.iterrows():
                try:
                    name = row.get("Name")
                    phone = str(row.get("Mobile Number", "")).strip()
                    email = str(row.get("Official Email", "")).strip().lower()
                    email = str(row.get("Official Email", "")).strip().lower()
                    email = email.replace("@nitsri.net", "@nitsri.ac.in")
                    hashed_password = make_password(email)


                    if not name or not email or "@" not in email:
                        self.stdout.write(self.style.WARNING(f"Skipping invalid row {idx}: missing/invalid name/email"))
                        continue

                    if email in usernames_seen or User.objects.filter(username=email).exists():
                        self.stdout.write(self.style.WARNING(f"Skipping duplicate/existing user: {email}"))
                        continue

                    usernames_seen.add(email)
                    dob_raw = pd.to_datetime(row.get("Date of Birth"), errors='coerce')
                    dob = dob_raw.date() if not pd.isna(dob_raw) else pd.to_datetime("1970-01-01").date()

                    user = User(
                        username=email,
                        email=email,
                        password=hashed_password,
                        first_name=name.split()[0]
                    )

                    raw_department = str(row.get("Organization Unit", ""))
                    department = re.sub(' +', ' ', raw_department).strip()
                    department = re.sub(r'^department of\s+', '', department, flags=re.IGNORECASE)

                    faculty = Faculty(
                        user=None,  # Assign later after user bulk_create
                        name=name,
                        email=email,
                        phone_number=phone,
                        date_of_birth=dob,
                        university="NIT-Sri",
                        department=reverse_lookup(departments_map, department),
                        designation=reverse_lookup(designation_map, row.get("Post")),
                        type_of_employee=reverse_lookup(toe_map, row.get("Type of Employee")),
                        nature_of_employment=reverse_lookup(noe_map, row.get("Nature of Employment")),
                    )

                    users.append(user)
                    faculties.append(faculty)
                    user_map[email] = user
                    faculty_map[email] = faculty

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row {idx}: {e}"))
                    logger.error(f"Error on row {idx}: {row.to_dict()}", exc_info=e)

            if not users:
                self.stdout.write(self.style.WARNING("No valid users to create."))
                return

            with transaction.atomic():
                User.objects.bulk_create(users)
                # Assign user FK after user save
                for email in user_map:
                    faculty_map[email].user = user_map[email]
                Faculty.objects.bulk_create(faculties)
                roles = []
                for email, faculty in faculty_map.items():
                    roles.append(Roles(faculty=faculty, role='FAC'))
                    if email in HOD_EMAILS:
                        roles.append(Roles(faculty=faculty, role='HOD'))
                        print(f"{email} - {faculty.name} assigned HOD")
                Roles.objects.bulk_create(roles)
            self.stdout.write(self.style.SUCCESS(f"Successfully created {len(users)} faculty users."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed during execution: {e}"))
            logger.exception("Unhandled exception during faculty creation")
