from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tasks.views import TaskViewSet, task_page

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("", task_page, name="task-page"),
    path("api/", include(router.urls)),
]
