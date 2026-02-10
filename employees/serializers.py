from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "employee_id", "full_name", "email", "department", "created_at"]

    def validate(self, attrs):
        for f in ["employee_id", "full_name", "email", "department"]:
            if not attrs.get(f):
                raise serializers.ValidationError({f: "This field is required."})
        return attrs