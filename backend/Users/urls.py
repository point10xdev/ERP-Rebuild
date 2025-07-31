from django.contrib.auth import views
from django.urls import path
from .views import *
from .authSerializer import *

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    # path('api/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    # path('api/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    path('student/', MultiFuctionalStudentAPI.as_view(), name='student-list'), 
    path('student/<int:pk>/', MultiFuctionalStudentAPI.as_view(), name='student-detail'),
    path('faculty/', MultiFuctionalFacultyAPI.as_view(), name='faculty-list'),
    path('faculty/<int:pk>/', MultiFuctionalFacultyAPI.as_view(), name='faculty-detail'),
    path('roles/', GetRoleAPI.as_view(), name='role-list'),
    path('members/', GetMembersAPI.as_view(), name='get-members'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('temp/getid/', GetID.as_view(), name='getid'),

    
]
