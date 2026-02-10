from django.db import models

# Create your models here.

class Employee(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=80)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"