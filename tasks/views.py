from rest_framework import viewsets
from django.shortcuts import render

from tasks.models import Task
from tasks.serializers import TaskSerializer


def task_page(request):
    return render(request, "tasks/task_list.html")


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
