from django.db import models

# Create your models here.

from employees.models import Employee

class Attendance(models.Model):
    STATUS_PRESENT = "PRESENT"
    STATUS_ABSENT = "ABSENT"
    STATUS_CHOICES = [
        (STATUS_PRESENT, "Present"),
        (STATUS_ABSENT, "Absent"),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance")
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.employee.employee_id} {self.date} {self.status}"