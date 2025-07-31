from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .models import *
from .views import getRoleList
from .serializers import FacultySerializer, StudentSerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh_token_str = attrs.get("refresh")
        access_token_str = self.context['request'].data.get("access")

        try:
            AccessToken(access_token_str)
        except Exception:
            raise serializers.ValidationError({
                "access": "Access token is invalid or expired."
            })

        try:
            refresh = RefreshToken(refresh_token_str)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        user_id = refresh["user_id"]
        user = User.objects.get(id=user_id)
        new_access = str(refresh.access_token)

        data = {
            "tokens": {
                "access": new_access,
                "refresh": refresh_token_str,
            }
        }

        try:
            faculty = Faculty.objects.get(user=user)
            faculty_data = FacultySerializer(faculty).data
            roles = getRoleList(faculty.id)
            faculty_data["roles"] = roles
            data["faculty"] = faculty_data
        except Faculty.DoesNotExist:
            try:
                scholar = Student.objects.get(user=user)
                scholar_data = StudentSerializer(scholar).data
                data["scholar"] = scholar_data
            except Student.DoesNotExist:
                raise serializers.ValidationError("User is neither faculty nor scholar")

        return data
    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Default values
        user_type = None
        roles = []
        # Try to determine if user is faculty or scholar
        try:
            faculty = Faculty.objects.get(user=user)
            user_type = 'faculty'
            roles = getRoleList(faculty.id)
            token['id'] = faculty.id  # Use faculty model id
        except Faculty.DoesNotExist:
            try:
                student = Student.objects.get(user=user)
                user_type = 'scholar'
                roles = ['Scholar']
                token['id'] = student.id  # Use student model id
            except Student.DoesNotExist:
                token['id'] = user.id  # fallback to auth user id
        token['type'] = user_type
        token['roles'] = roles
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['tokens'] = {
            'access': data.pop('access'),
            'refresh': data.pop('refresh')
        }
        role_list=[]
        try:
            faculty = Faculty.objects.get(user=user)
            user_data = FacultySerializer(faculty).data
            data['faculty'] = user_data
            role_list = getRoleList(faculty.id)
            data['faculty']['roles'] = role_list
        except Faculty.DoesNotExist:
            try:
                student = Student.objects.get(user=user)
                user_data = StudentSerializer(student).data
                data['scholar'] = user_data 
            except Student.DoesNotExist:
                raise serializers.ValidationError("User is neither a faculty nor a student")
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer