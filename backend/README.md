# Django Project Setup

Follow the steps below to set up the Django project in a virtual environment.

## 1. Create a Virtual Environment

Create a virtual environment to isolate your project dependencies.

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py migrate --run-syncdb
python manage.py runserver

# custom management command for some table entries
python manage.py createsuperuser # (Username: admin , Password: root)
python manage.py employeeEntries
python manage.py scholarEntries
```

## 2. Admin Credentials

To access the Django admin interface, use the following credentials:

- **Username:** `admin`
- **Password:** `root`

Navigate to [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) in your browser to log in to the admin interface.
