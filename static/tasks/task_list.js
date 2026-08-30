$(function () {
    const apiUrl = "/api/tasks/";
    const $form = $("#task-form");
    const $taskList = $("#task-list");
    const $emptyState = $("#empty-state");
    const $message = $("#message");
    const csrfToken = $("[name=csrfmiddlewaretoken]").val();

    function showMessage(text) {
        $message.text(text).removeClass("hidden");
    }

    function clearMessage() {
        $message.addClass("hidden").empty();
    }

    function apiError(xhr) {
        const data = xhr.responseJSON;
        if (!data) return "Não foi possível concluir a operação.";
        if (data.detail) return data.detail;
        return Object.values(data).flat().join(" ");
    }

    function renderTasks(data) {
        const tasks = Array.isArray(data) ? data : data.results || [];
        const pending = tasks.filter((task) => !task.completed).length;
        $("#pending-count").text(pending);
        $taskList.empty();
        $emptyState.toggleClass("hidden", tasks.length > 0);

        tasks.forEach((task) => {
            const date = task.created_at
                ? new Date(task.created_at).toLocaleDateString("pt-BR")
                : "";
            const $item = $("<article>", {
                class: "task" + (task.completed ? " is-complete" : ""),
                "data-id": task.id,
            });
            const $check = $("<input>", {
                type: "checkbox",
                class: "task-check",
                checked: task.completed,
                "aria-label": "Marcar tarefa como concluída",
            });
            const $content = $("<div>");
            $("<div>", { class: "task-title", text: task.title }).appendTo($content);
            if (task.description) {
                $("<p>", { class: "task-description", text: task.description }).appendTo($content);
            }
            if (date) $("<div>", { class: "task-date", text: date }).appendTo($content);
            const $actions = $("<div>", { class: "task-actions" });
            $("<button>", { type: "button", class: "action-button edit", text: "Editar" }).appendTo($actions);
            $("<button>", { type: "button", class: "action-button delete", text: "Excluir" }).appendTo($actions);
            $item.append($check, $content, $actions).appendTo($taskList);
        });
    }

    function loadTasks() {
        clearMessage();
        $.getJSON(apiUrl).done(renderTasks).fail(function (xhr) {
            showMessage(apiError(xhr));
        });
    }

    function resetForm() {
        $form[0].reset();
        $("#task-id").val("");
        $("#submit-task").text("Adicionar tarefa");
        $("#cancel-edit").addClass("hidden");
        $("#form-title").text("O que precisa ser feito?");
    }

    $form.on("submit", function (event) {
        event.preventDefault();
        const taskId = $("#task-id").val();
        const payload = {
            title: $("#title").val().trim(),
            description: $("#description").val().trim(),
        };
        const request = taskId
            ? $.ajax({ url: apiUrl + taskId + "/", method: "PATCH", data: JSON.stringify(payload), contentType: "application/json", headers: { "X-CSRFToken": csrfToken } })
            : $.ajax({ url: apiUrl, method: "POST", data: JSON.stringify(payload), contentType: "application/json", headers: { "X-CSRFToken": csrfToken } });

        request.done(function () {
            resetForm();
            loadTasks();
        }).fail(function (xhr) {
            showMessage(apiError(xhr));
        });
    });

    $taskList.on("change", ".task-check", function () {
        const $check = $(this);
        $.ajax({
            url: apiUrl + $check.closest(".task").data("id") + "/",
            method: "PATCH",
            data: JSON.stringify({ completed: $check.is(":checked") }),
            contentType: "application/json",
            headers: { "X-CSRFToken": csrfToken },
        }).done(loadTasks).fail(function (xhr) {
            $check.prop("checked", !$check.is(":checked"));
            showMessage(apiError(xhr));
        });
    });

    $taskList.on("click", ".edit", function () {
        const id = $(this).closest(".task").data("id");
        $.getJSON(apiUrl + id + "/").done(function (task) {
            $("#task-id").val(task.id);
            $("#title").val(task.title);
            $("#description").val(task.description);
            $("#submit-task").text("Salvar alterações");
            $("#cancel-edit").removeClass("hidden");
            $("#form-title").text("Editar tarefa");
            $("#title").trigger("focus");
        }).fail(function (xhr) {
            showMessage(apiError(xhr));
        });
    });

    $taskList.on("click", ".delete", function () {
        const $task = $(this).closest(".task");
        if (!window.confirm("Excluir esta tarefa?")) return;
        $.ajax({
            url: apiUrl + $task.data("id") + "/",
            method: "DELETE",
            headers: { "X-CSRFToken": csrfToken },
        }).done(loadTasks).fail(function (xhr) {
            showMessage(apiError(xhr));
        });
    });

    $("#cancel-edit").on("click", resetForm);
    $("#refresh-tasks").on("click", loadTasks);
    loadTasks();
});
