from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import *


User = get_user_model()

    
class StudentSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.CharField(source='supervisor.name', read_only=True)
    class Meta:
        model = Student
        fields = '__all__'  
        extra_fields = ['supervisor_name'] 
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['supervisor_name'] = instance.supervisor.name if instance.supervisor else None
        return ret
class StudentLimitedUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['phone_number', 'present_address', 'current_address', 'profile_pic','account_no','ifsc','email']

class FacultySerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    class Meta:
        model = Faculty
        fields = '__all__'

    def get_roles(self, obj):
        roles_qs = Roles.objects.filter(faculty=obj)
        return [r.role for r in roles_qs]

class FacultyLimitedUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['phone_number', 'address', 'profile_pic']
    
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = ['role']
    
