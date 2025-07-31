from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from .models import *
from Users.models import *
from Users.views import getRoleList,validRolesList
from rest_framework import status
import calendar
# Create your views here.


# ===Ray===
class MultiFuctionalScholarshipAPI(APIView):
    @staticmethod
    def get_students_by_role(role, faculty_id):
        try:
            faculty = Faculty.objects.get(id=faculty_id)
            if role == "FAC":
                return Student.objects.filter(supervisor__id=faculty_id)
            elif role == "HOD":
                return Student.objects.filter(department=faculty.department)
            elif role in ["DEAN","AD"] :
                return Student.objects.filter(university=faculty.university)
        except Faculty.DoesNotExist:
            return None
    
    def get(self, request, format=None):
        scholarship_id = request.query_params.get('id')
        scholar_id = request.query_params.get('scholar')
        faculty_id = request.query_params.get('faculty')
        role = request.query_params.get('role')
        filter_type = request.query_params.get('type',None)

        scholarships = None

        if scholarship_id:
            try:
                scholarship = Scholarship.objects.get(id=scholarship_id)
                serializer = ScholarshipSerializer(scholarship)
                return Response({'scholarship': serializer.data}, status=status.HTTP_200_OK)
            except Scholarship.DoesNotExist:
                return Response({"error": "Scholarship not found"}, status=status.HTTP_404_NOT_FOUND)

        if scholar_id:
            scholarships = Scholarship.objects.filter(scholar__id=scholar_id)

        # Case 3: Filter by faculty role
        elif faculty_id and role:
            roles_assigned = getRoleList(faculty_id)
            valid_roles = validRolesList()
            if role not in valid_roles or role not in roles_assigned:
                return Response(
                    {"error": f"Faculty is not valid for role {role}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            students = self.get_students_by_role(role, faculty_id)
            
            if students is None:
                return Response(
                    {"error": "Faculty not found or role handler missing."},
                    status=status.HTTP_404_NOT_FOUND
                )
            scholarships = Scholarship.objects.filter(scholar__in=students)
            scholarships = scholarships.filter(stage__role=role,).distinct()
        elif faculty_id:
            return Response({"error": "role parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        elif role:
            return Response({"error": "faculty parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            scholarships = Scholarship.objects.all()
        if not filter_type: pass
        elif filter_type == 'current':
            scholarships = scholarships.filter(release=False)
        elif filter_type == 'previous':
            scholarships = scholarships.filter(release=True)
        elif filter_type == 'approved':
            scholarships = scholarships.filter(status=1)
        elif filter_type == 'pending':
            scholarships = scholarships.filter(status=2)
        elif filter_type == 'role_approved':
            scholarships = scholarships.filter(stage__status="1",stage__role=role)
        elif filter_type == 'role_pending':
            scholarships = scholarships.filter(stage__status="2",stage__role=role)
        elif filter_type in calendar.month_name:
            month_number = list(calendar.month_name).index(filter_type)
            scholarships = scholarships.filter(month=month_number)
        else:
            return Response({"error": "Unknown type"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ScholarshipSerializer(scholarships, many=True)
        return Response({'scholarships': serializer.data}, status=status.HTTP_200_OK)
    def post(self, request, format=None):
            scholarship_id = request.data.get('id')
            scholar_id = request.data.get('scholar')
            faculty_id = request.data.get('faculty')
            role = request.data.get('role')
            if not scholarship_id:
                return Response({"error": "Scholarship ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                scholarship = Scholarship.objects.select_related('scholar').get(id=scholarship_id)
            except Scholarship.DoesNotExist:
                return Response({"error": "Scholarship not found."}, status=status.HTTP_404_NOT_FOUND)
            # Scholar flow - Release the scholarship
            if scholar_id:
                if str(scholarship.scholar.id) != str(scholar_id) or scholarship.status != "2" or scholarship.release==True:
                    return Response({
                        "error": f"Scholarship does not belong to student ID {scholar_id} or is not pending or already released."
                    }, status=status.HTTP_400_BAD_REQUEST)
                try:
                    Stage.objects.create(scholarship=scholarship, role="FAC")
                    scholarship.release = True
                    scholarship.save()
                    return Response({
                        "success": f"Scholarship released by {scholar_id} and SUP stage created."
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"error": f"Error creating stage: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            # Faculty flow - Review stage
            elif faculty_id and role:
                if scholarship.release != True:
                    return Response({
                        "error": f'Scholarship not released yet'
                    }, status=status.HTTP_400_BAD_REQUEST)
                roles_assigned = getRoleList(faculty_id)
                valid_roles = validRolesList()
                print(roles_assigned)
                if role not in valid_roles or role not in roles_assigned:
                    return Response({
                        "error": f"Faculty is not valid for role '{role}'."
                    }, status=status.HTTP_400_BAD_REQUEST)

                try:
                    current_stage = Stage.objects.get(scholarship=scholarship, role=role, status=2)
                except Stage.DoesNotExist:
                    return Response({
                        "error": f"No pending stage found for role '{role}' on this scholarship."
                    }, status=status.HTTP_404_NOT_FOUND)

                decision = request.data.get("status")
                comment = request.data.get("comment", "")
                d_days=request.data.get("deducted_days", None)
                

                if decision not in ["accept", "reject"]:
                    return Response({
                        "error": "Invalid status. Must be 'accept' or 'reject'."
                    }, status=status.HTTP_400_BAD_REQUEST)
                if decision == "reject":    # need to handle this also 
                    return Response({
                        "error": "Reject state is not handled."
                    }, status=status.HTTP_400_BAD_REQUEST)
                # Update current stage
                current_stage.status = 1  # Accepted
                current_stage.comment = comment
                try:
                    faculty = Faculty.objects.get(id=faculty_id)
                except Faculty.DoesNotExist:
                    return Response({"error": f"Faculty with ID {faculty_id} not found."}, status=status.HTTP_404_NOT_FOUND)
                try:
                    scholar = scholarship.scholar 
                except Student.DoesNotExist:
                    return Response({"error": "Scholar linked to this scholarship not found."}, status=status.HTTP_404_NOT_FOUND)
                next_stage=None
                if role == "FAC":
                    if scholar.supervisor != faculty:
                        return Response({
                            "error": f"Provided faculty ID {faculty_id} is not the supervisor of the scholarship ID {scholarship_id}."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    next_stage = Stage(scholarship=scholarship, role="HOD")
                elif role == "HOD":
                    if scholar.department != faculty.department:
                        return Response({
                            "error": f"Provided faculty ID {faculty_id} is not in the same department as the scholar for scholarship ID {scholarship_id}."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    next_stage = Stage(scholarship=scholarship, role="AD")
                elif role == "AD":
                    if scholar.university != faculty.university:
                        return Response({
                            "error": f"Provided faculty ID {faculty_id} is not in the same department as the scholar for scholarship ID {scholarship_id}."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    next_stage = Stage(scholarship=scholarship, role="DEAN")
                elif role == "DEAN":
                    if scholar.university != faculty.university:
                        return Response({
                            "error": f"Provided faculty ID {faculty_id} is not in the same university as the scholar for scholarship ID {scholarship_id}."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    scholarship.status = 1
                if d_days is not None:
                    try:
                        d_days = int(d_days)
                        if d_days < 0 or d_days > scholarship.days:
                            return Response({
                                "error": "Invalid number of deducted days."
                            }, status=status.HTTP_400_BAD_REQUEST)
                        scholarship.total_pay = (scholarship.days - d_days) * scholarship.total_pay_per_day
                        scholarship.days -= d_days
                    except ValueError:
                        return Response({
                            "error": "deducted_days must be an integer."
                        }, status=status.HTTP_400_BAD_REQUEST)
                scholarship.save()
                current_stage.save()
                if next_stage:
                    next_stage.save()
                
                return Response({
                    "success": f"Stage '{role}' successfully updated to '{decision}'."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Either scholar_id or (faculty_id and role) must be provided."
                }, status=status.HTTP_400_BAD_REQUEST)
                
class MultiFuctionalStageAPI(APIView):
    def get(self, request, format=None):
        scholarship_id = request.query_params.get('id')
        filter_type = request.query_params.get('type', None)
        if not scholarship_id:
            return Response({"error": "Scholarship ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        stages = Stage.objects.filter(scholarship__id=scholarship_id)
        if not stages.exists():
            return Response({"error": "No stages found for the given scholarship."}, status=status.HTTP_404_NOT_FOUND)
        if not filter_type:
            stages = stages.order_by('id')
            serializer = StageSerializer(stages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif filter_type == 'latest':
            latest_stage = stages.order_by('-id').first()
            serializer = StageSerializer(latest_stage)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": f"Unknown filter type '{filter_type}'."}, status=status.HTTP_400_BAD_REQUEST)



