import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from Users.models import Faculty,Roles
import logging
import os
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create Faculty entries from employee Excel file'

    def handle(self, *args, **kwargs):
        try:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            scholar_df = pd.read_excel(os.path.join(BASE_DIR, 'media/Users/employee.xlsx'))
            users_to_create = []
            faculties_to_create = []
            roles_to_create = []
            usernames_seen = set()
            hashed_password = make_password("root")
            for _, row in scholar_df.iterrows():
                try:
                    name = row.get("Name")
                    phone = row.get("Mobile Number")
                    email = row.get("Official Email")
                    toe = row.get("Type of Employee")
                    noe = row.get("Nature of Employment")
                    post = row.get("Post")
                    dept = row.get("Organization Unit")
                    dob_raw = row.get("Date of Birth")
                    dob_parsed = pd.to_datetime(dob_raw, errors='coerce')
                    date_of_birth = dob_parsed.date() if pd.notna(dob_parsed) else pd.to_datetime("1970-01-01").date()
                    if pd.isna(email) or "@" not in str(email):
                        raise ValueError(f"Invalid email for {name}: {email}")
                    username = str(email).strip().lower()
                    if username in usernames_seen:
                        raise ValueError(f"Duplicate email/username detected: {username}")
                    usernames_seen.add(username)
                    if User.objects.filter(username=username).exists():
                        raise ValueError(f"User already exists: {username}")
                    user = User(
                        username=username,
                        password=hashed_password,
                        email=username,
                        first_name=name.split()[0] if name else ''
                    )
                    university = "NIT-Sri"
                    designation = post if post else "OTHERS"
                    toe = toe.strip() if toe else "Teaching"
                    noe = noe.strip() if noe else "Permanent"
                    faculty = Faculty(
                        user=user,
                        name=name,
                        email=username,
                        phone_number=str(phone).strip(),
                        date_of_birth=date_of_birth,
                        department=dept,
                        university=university,
                        designation=designation,
                        type_of_employee=toe,
                        nature_of_employment=noe,
                    )
                    roles=Roles(
                        faculty=faculty,
                        role='FAC'
                    )
                    users_to_create.append(user)
                    faculties_to_create.append(faculty)
                    roles_to_create.append(roles)
                    print(f"{name} added:")
                except Exception as e:
                    logger.error(f"Error preparing row {row.to_dict()}: {e}")
                    return 
            with transaction.atomic():
                User.objects.bulk_create(users_to_create)
                for user, faculty in zip(users_to_create, faculties_to_create):
                    faculty.user = user
                Faculty.objects.bulk_create(faculties_to_create)
                for faculty, role in zip(faculties_to_create, roles_to_create):
                    role.faculty = faculty
                Roles.objects.bulk_create(roles_to_create)
            logger.info(f"{len(faculties_to_create)} Faculty records (and users) created successfully.")
        except Exception as e:
            logger.error(f"Failed during processing: {e}")
