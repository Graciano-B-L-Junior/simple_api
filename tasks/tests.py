import pytest
from rest_framework import status
from rest_framework.test import APIClient

from tasks.models import Task


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_create_task(api_client):
    response = api_client.post(
        "/api/tasks/",
        {"title": "Write tests", "description": "Cover the API"},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["title"] == "Write tests"
    assert response.data["completed"] is False
    assert Task.objects.get().description == "Cover the API"


@pytest.mark.django_db
def test_list_tasks_orders_incomplete_first(api_client):
    completed = Task.objects.create(title="Done", completed=True)
    pending = Task.objects.create(title="Next")

    response = api_client.get("/api/tasks/")

    assert response.status_code == status.HTTP_200_OK
    assert [task["id"] for task in response.data] == [pending.id, completed.id]


@pytest.mark.django_db
def test_update_task(api_client):
    task = Task.objects.create(title="Draft")

    response = api_client.patch(
        f"/api/tasks/{task.id}/", {"completed": True}, format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["completed"] is True
    assert Task.objects.get(id=task.id).completed is True
