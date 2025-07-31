from django.core.management.base import BaseCommand

from Scholarship.models import Scholarship
from Users.models import Student
from datetime import date
from calendar import monthrange
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create a Scholarship entry for the 1st of the current month'
    def handle(self, *args, **kwargs):
        today = date.today()
        current_month = today.month
        current_year = today.year
        success_count = 0
        error_count = 0
        students = Student.objects.all()
        for student in students:
            try:
                if Scholarship.objects.filter(scholar=student, month=current_month, year=current_year).exists():
                    logger.info(f"Scholarship already exists for {student} in {current_month}/{current_year}")
                    continue
                Scholarship.objects.create(
                    scholar=student,
                    month=current_month,
                    year=current_year
                )
                success_count += 1
            except Exception as e:
                logger.error(f"Error creating scholarship for {student}: {str(e)}")
                error_count += 1
        self.stdout.write(
            self.style.SUCCESS(f"Scholarships created: {success_count}, Errors: {error_count}")
        )
