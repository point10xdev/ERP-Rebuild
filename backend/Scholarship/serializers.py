from rest_framework import serializers
from .models import *

class ScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='scholar.name', read_only=True)
    class Meta:
        model = Scholarship
        fields = ['id', 'scholar', 'month', 'year', 'days', 'total_pay', 'total_pay_per_day', 'release', 'status', 'student_name']
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Remove redundant scholar_name field since we already have student_name
        if 'scholar_name' in ret:
            del ret['scholar_name']
        return ret
    def validate_scholar(self, scholar):
        if scholar.admission_category != "INST_FEL":
            raise serializers.ValidationError("Only INST_FEL category scholars are eligible for scholarship.")
        return scholar

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = '__all__'