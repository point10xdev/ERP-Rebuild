from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from datetime import timedelta
from rest_framework_simplejwt.exceptions import TokenError
import pprint



# ===Ray===

# Functions --->
import os
import json

def validRolesList():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    department_json_path = os.path.join(BASE_DIR, 'conf.json')
    
    try:
        if not os.path.exists(department_json_path) or os.stat(department_json_path).st_size == 0:
            raise FileNotFoundError("conf.json does not exist or is empty.")
        
        with open(department_json_path, 'r') as file:
            college_data = json.load(file)
            return list(college_data.get('college', {}).get('roles', {}).keys())
    except Exception as e:
        print(f"Failed to load valid roles from conf.json: {e}")
        return []



def getRoleList(faculty_id):
    role_list=[]
    roles=Roles.objects.filter(faculty__id=faculty_id)
    if not roles.exists():
        return role_list
    serializers=RoleSerializer(roles,many=True)
    for entry in serializers.data:
        role_list.append(entry.get("role"))
    return role_list













# all Student related api request
class MultiFuctionalStudentAPI(APIView):
    # permission_classes = [IsAuthenticated]
    # need to fix the int() wala exception
    def get(self, request, format=None):
        # student=Student.objects.get(user__id=request.user.id)
        # print(f"working {student.name}")
        student_id = request.query_params.get('id', None) 
        department = request.query_params.get('department', None)
        faculty_id = request.query_params.get('faculty', None)
        university_name = request.query_params.get('university', None)
        # sirf ek user ayega 
        if student_id:
            try:
                student = Student.objects.get(id=int(student_id))
                serializer = StudentSerializer(student)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Student.DoesNotExist:
                return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        # all department filtered users ayega 
        elif department:
            students = Student.objects.filter(department__iexact=department)
            if not students.exists():
                return Response(
                    {"error": f"No students found in department '{department}'."},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # all supervisor filtered users ayega 
        elif faculty_id:
            student_list = Student.objects.filter(supervisor__id=int(faculty_id))
            if not student_list.exists():
                return Response({'error': f"No students found for faculty ID {faculty_id}."},
                                status=status.HTTP_404_NOT_FOUND)
            serializer = StudentSerializer(student_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # all university filtered users ayega 
        elif university_name:
            student_list = Student.objects.filter(university__iexact=university_name)
            if not student_list.exists():
                return Response({'error': f"No students found for University: {university_name}."},
                                status=status.HTTP_404_NOT_FOUND)
            serializer = StudentSerializer(student_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # Default: return all students
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk=None):
        if pk is None:
            return Response({"error": "Student ID required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pk = int(pk)
        except ValueError:
            return Response({"error": "Invalid ID format"}, status=status.HTTP_400_BAD_REQUEST)
        student = get_object_or_404(Student, pk=pk)
        serializer = StudentLimitedUpdateSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# all Faculty related api request 
class MultiFuctionalFacultyAPI(APIView):
    # need to fix the int() wala exception
    def get(self, request, format=None):
        faculty_id = request.query_params.get('id', None)
        department = request.query_params.get('department', None)
        student_id = request.query_params.get('student', None)
        university_name = request.query_params.get('university', None)
        # sirf ek faculty ayega 
        if faculty_id:
            try:
                faculty = Faculty.objects.get(id=int(faculty_id))
                serializer = FacultySerializer(faculty)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Faculty.DoesNotExist:
                return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)
        # all department filtered faculty ayega 
        elif department:
            faculty_list = Faculty.objects.filter(department__iexact=department)
            if not faculty_list.exists():
                return Response(
                    {"error": f"No faculty found in department '{department}'."},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = FacultySerializer(faculty_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # all supervisor filtered users ayega 
        elif student_id:
            try:
                student = Student.objects.get(id=int(student_id))
                faculty = student.supervisor
                if not faculty:
                    return Response({'error': f"No faculty (supervisor) assigned to student ID {student_id}."},
                                    status=status.HTTP_404_NOT_FOUND)
                serializer = FacultySerializer(faculty)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Student.DoesNotExist:
                return Response({'error': 'Student is invalid'}, status=status.HTTP_404_NOT_FOUND)
        # all university filtered users ayega 
        elif university_name:
            faculty_list = Faculty.objects.filter(university__iexact=university_name)
            if not faculty_list.exists():
                return Response({'error': f"No faculty found for University: {university_name}."},
                                status=status.HTTP_404_NOT_FOUND)
            serializer = FacultySerializer(faculty_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # Default: return all faculty
        faculty_list = Faculty.objects.all()
        serializer = FacultySerializer(faculty_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk):
        pprint.pprint(request.data)
        if pk is None:
            return Response({"error": "Faculty ID required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pk = int(pk)
        except ValueError:
            return Response({"error": "Invalid ID format"}, status=status.HTTP_400_BAD_REQUEST)
        faculty = get_object_or_404(Faculty, pk=pk)
        serializer = FacultyLimitedUpdateSerializer(faculty, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetRoleAPI(APIView):
    def get(self, request, format=None):
        faculty_id = request.query_params.get('faculty', None)
        try:
            faculty_id = int(faculty_id)
        except (TypeError, ValueError):
            return Response({'error': "Faculty ID is not valid"}, status=status.HTTP_400_BAD_REQUEST)
        role_list = getRoleList(faculty_id)
        if role_list:
            return Response(role_list, status=status.HTTP_200_OK)
        else:
            return Response({'error': "Role not found"}, status=status.HTTP_404_NOT_FOUND)

class GetMembersAPI(APIView):
    def get(self, request, format=None):
        id = request.query_params.get('id')
        role = request.query_params.get('role')
        data = []
        def get_faculty_with_role(role_name):
            try:
                return Faculty.objects.get(roles__role=role_name)
            except Faculty.DoesNotExist:
                return None
        def get_profile_pic_url(profile_pic):
            if profile_pic and hasattr(profile_pic, 'url'):
                return profile_pic.url
            return None
        # Common roles
        dean = get_faculty_with_role("DEAN")
        ad = get_faculty_with_role("AD")
        acc = get_faculty_with_role("AC")
        if not role:
            return Response({'error': "Role is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if role == "scholar":
                user = Student.objects.get(id=id)
                # Supervisor
                if user.supervisor:
                    data.append({
                        "name": user.supervisor.name,
                        "role": "Supervisor",
                        "src": get_profile_pic_url(user.supervisor.profile_pic)
                    })
                # Co-Supervisor
                if user.co_supervisor:
                    data.append({
                        "name": user.co_supervisor.name,
                        "role": "Co-Supervisor",
                        "src": get_profile_pic_url(user.co_supervisor.profile_pic)
                    })
                # HOD
                if user.department:
                    try:
                        hod = Faculty.objects.filter(roles__role="HOD", department=user.department).first()
                        data.append({
                            "name": hod.name,
                            "role": "Head of Department",
                            "src": get_profile_pic_url(hod.profile_pic)
                        })
                    except Faculty.DoesNotExist:
                        pass
            elif role == "FAC":
                user = Faculty.objects.get(id=id)
                if user.department:
                    try:
                        hod = Faculty.objects.filter(roles__role="HOD", department=user.department).first()
                        data.append({
                            "name": hod.name,
                            "role": "Head of Department",
                            "src": get_profile_pic_url(hod.profile_pic)
                        })
                    except Faculty.DoesNotExist:
                        pass
            else:
                # For all other roles, no user fetch needed
                pass
            # Add roles common to all
            if dean:
                data.append({
                    "name": dean.name,
                    "role": "Dean",
                    "src": get_profile_pic_url(dean.profile_pic)
                })
            if ad:
                data.append({
                    "name": ad.name,
                    "role": "Associate Dean",
                    "src": get_profile_pic_url(ad.profile_pic)
                })
            if acc:
                data.append({
                    "name": acc.name,
                    "role": "Accounts",
                    "src": get_profile_pic_url(acc.profile_pic)
                })
            if not data:
                return Response({'error': "No members found for the given role"}, status=status.HTTP_404_NOT_FOUND)
            return Response(data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response({'error': "Scholar not found"}, status=status.HTTP_404_NOT_FOUND)
        except Faculty.DoesNotExist:
            return Response({'error': "Faculty not found"}, status=status.HTTP_404_NOT_FOUND)


class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.pk}/{token}/"  # your frontend handles the form
            # Send email (adjust your backend SMTP settings accordingly)
            send_mail(
                subject="Password Reset",
                message=f"Click the link to reset your password: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({"message": "Password reset link sent"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)


class GenerateTokenView(APIView):
    def post(self, request):
        user_id = request.data.get('user')
        meta = request.data.get('token_type',None)
        if not meta:
            return Response({"error": "Meta is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=user_id)
            token = AccessToken.for_user(user)
            token.set_exp(lifetime=timedelta(minutes=15))
            token['token_type'] = meta
            token['id'] = user_id
            return Response({
                "reset_token": str(token),
                "expires_in": "15 minutes"
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)




class ResetPasswordView(APIView):
    def post(self, request):
        # token_str = request.data.get('token')
        user_id = request.data.get('user')
        new_password = request.data.get('new_password')
        # if not all([token_str, user_id, new_password]):
        #     return Response({"error": "Token, user ID, and new password are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # token = AccessToken(token_str)
            # if token.get('token_type') != 'reset_password':
            #     return Response({"error": "Invalid token type"}, status=status.HTTP_403_FORBIDDEN)
            # if str(token.get('id')) != str(user_id):
            #     return Response({"error": "Token user ID mismatch"}, status=status.HTTP_403_FORBIDDEN)
            user = User.objects.get(pk=user_id)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class LogoutView(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful.'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class GetID(APIView):
    def get(self, request, format=None):
        email = request.query_params.get('mail', None)
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        # Try to find in Student model
        student = Student.objects.filter(email=email).first()
        if student:
            user = student.user
            return Response({
                "id": user.id,
                "username": user.username,
            }, status=status.HTTP_200_OK)

        # Try Faculty if not found in Student
        faculty = Faculty.objects.filter(email=email).first()
        if faculty:
            user = faculty.user
            return Response({
                "id": user.id,
                "username": user.username,
            }, status=status.HTTP_200_OK)

        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


