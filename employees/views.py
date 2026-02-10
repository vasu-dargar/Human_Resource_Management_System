from django.shortcuts import render

# Create your views here.

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q

from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().order_by("employee_id")
    serializer_class = EmployeeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=400)
        try:
            employee = serializer.save()
        except Exception as e:
            # MySQL unique constraint errors can be handled more specifically if desired
            return Response({"error": "Could not create employee", "details": str(e)}, status=409)
        return Response(EmployeeSerializer(employee).data, status=201)

class EmployeeDeleteView(generics.DestroyAPIView):
    queryset = Employee.objects.all()