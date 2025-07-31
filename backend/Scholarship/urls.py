from django.contrib.auth import views
from django.urls import path
from .views import *

urlpatterns = [
    path('manage/', MultiFuctionalScholarshipAPI.as_view(), name='scholarship-list'),
    path('stage/', MultiFuctionalStageAPI.as_view(), name='scholarship-list'),
]
