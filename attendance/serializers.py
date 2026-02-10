from rest_framework import serializers
from .models import Attendance
from employees.models import Employee

class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(write_only=True)
    employee = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "employee_id", "employee", "date", "status", "created_at"]

    def get_employee(self, obj):
        return {
            "id": obj.employee.id,
            "employee_id": obj.employee.employee_id,
            "full_name": obj.employee.full_name,
            "department": obj.employee.department,
        }

    def validate(self, attrs):
        if not attrs.get("employee_id"):
            raise serializers.ValidationError({"employee_id": "This field is required."})
        if not attrs.get("date"):
            raise serializers.ValidationError({"date": "This field is required."})
        if attrs.get("status") not in ["PRESENT", "ABSENT"]:
            raise serializers.ValidationError({"status": "Must be PRESENT or ABSENT."})
        return attrs

    def create(self, validated_data):
        emp_id = validated_data.pop("employee_id")
        try:
            employee = Employee.objects.get(employee_id=emp_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({"employee_id": "Employee not found."})

        # unique_together will protect too, but we give a clean message:
        if Attendance.objects.filter(employee=employee, date=validated_data["date"]).exists():
            raise serializers.ValidationError({"date": "Attendance already marked for this employee on this date."})

        return Attendance.objects.create(employee=employee, **validated_data)