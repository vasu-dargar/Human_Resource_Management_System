from django.shortcuts import render

# Create your views here.

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceCreateView(generics.CreateAPIView):
    serializer_class = AttendanceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=400)
        attendance = serializer.save()
        return Response(AttendanceSerializer(attendance).data, status=201)

class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        qs = Attendance.objects.select_related("employee").all()
        employee_id = self.request.query_params.get("employee_id")
        date = self.request.query_params.get("date")
        if employee_id:
            qs = qs.filter(employee__employee_id=employee_id)
        if date:
            qs = qs.filter(date=date)
        return qs