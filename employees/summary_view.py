from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from .models import Employee

class EmployeeSummaryView(APIView):
    def get(self, request, pk):
        try:
            emp = Employee.objects.get(pk=pk)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)

        total_present = emp.attendance.filter(status="PRESENT").count()
        return Response({"employee_id": emp.employee_id, "total_present_days": total_present}, status=200)