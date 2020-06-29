var departmentsList;

async function renderPage() {
  //get the departments
  await $.get("/api/departments", (data) => {
    departmentsList = data;
  });

  // Display number of departments
  $("#departmentNum").text(departmentsList.length);

  displayPaginatedContent(departmentsList);
}

//html to display an department
function renderItem(item) {
  html = `
  <tr id="${item.id}">
    <td>${item.name}</td>
    <td>${item.members
      .map(
        (member) =>
          `<span class="badge badge-secondary m-1">${member.firstName} ${member.lastName}</span>`
      )
      .join("")}</td>
      <td>
      <button type="button" onclick="removeDepartment(${
        item.id
      })" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editDepartment(${
        item.id
      })"class="btn btn-info">Edit</button>
      </td>
  </tr>`;

  return html;
}

//html to display an alert
function showAlert(response) {
  if (response.title == "Success") {
    return `
    <div class="alert alert-success  alert-dismissible fade show" role="alert">
      <strong>${response.title}!</strong> ${response.message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    `;
  } else {
    return `
    <div class="alert alert-danger  alert-dismissible fade show" role="alert">
      <strong>${response.title}!</strong> ${response.message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    `;
  }
}

//Refresh row
function resetRow(id) {
  var user;
  $.ajax({
    url: `/api/departments/${id}`,
    type: "GET",
    success: function (result) {
      $(`#${id}`).replaceWith(renderItem(result));
    },
  });
}

//pagination of list of departments
function displayPaginatedContent(data) {
  $("#pagination").pagination({
    dataSource: data,
    pageSize: 10,
    callback: function (data, pagination) {
      $(".paginationjs-pages > ul")
        .addClass("pagination justify-content-center")
        .children()
        .addClass("page-item")
        .children()
        .addClass("page-link");
      var dataHtml;
      $.each(data, function (index, item) {
        console.log(item);
        dataHtml += renderItem(item);
      });
      container = $("#tbody");
      container.html(dataHtml);
    },
  });
}
//Search department
function search() {
  var input = {
    name: $("#search-input").val().toLowerCase(),
  };

  var result = departmentsList.filter(function (department) {
    if (input)
      if (department.name.toLowerCase().indexOf(input.name) != -1) {
        return true;
      }
  });
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += renderItem(item);
    });
  } else {
    dataHtml = `<p>No departments found</p>`;
  }

  $("#pagination").pagination("hide");
  $("#removeFiltersButton").show();

  container = $("#tbody");
  container.html(dataHtml);
}

//Remove search filters
function removeFilters() {
  displayPaginatedContent(courseList);
  $("#removeFiltersButton").hide();
  $("#search-input").val("");
  $("select").selectpicker({ style: "btn-outline-secondary" });
}

// Display form to add a department
function newDepartment() {
  const form = `
<tr id="addDepartment">
    <form  id="addDepartmentForm"></form><input type="hidden" id="role" name="role" value="teacher" form="addDepartmentForm">
        <td><div class="control-group"><input type="text" class="form-control" placeholder="Department Name" name="name" id="name" form="addDepartmentForm" required></input></div></td>
        <td></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" form="addDepartmentForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
</tr>`;

  const button = $("#addDepartmentButton");
  const container = $("#tbody");
  if ($("#addDepartment").length === 0) {
    container.prepend(form);
    //Form post action
    $("#addDepartmentForm").submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: "/api/departments",
        type: "post",
        data: $("#addDepartmentForm").serialize(),
        error: function (data) {
          //Display error
          $("#alert").html(showAlert(data.responseJSON));
        },
        success: function (data) {
          //Display success
          $("#alert").html(showAlert(data));
          newDepartment();
          renderPage();
        },
      });
    });
  } else {
    $("#addDepartment").remove();
  }
  button.toggleClass("active");
}

//remove department
function removeDepartment(id) {
  if (confirm("Are you sure you want to delete this department?")) {
    $.ajax({
      url: `/api/departments/${id}`,
      type: "DELETE",
      success: function (data) {
        //Display success
        $("#alert").html(showAlert(data));
        renderPage();
      },
      error: function (data) {
        //Display error
        $("#alert").html(showAlert(data.responseJSON));
      },
    });
  }
}

//edit department
function editDepartment(id) {
  var department = departmentsList
    .filter((department) => department.id == id)
    .pop();

  $(`#${id}`).html(`
            <form id="editDepartmentForm-${id}"></form>
            <input type="hidden" id="id" name="id" value="${id}" form="editDepartmentForm-${id}">
            <td><div class="control-group"><input value="${
              department.name
            }" type="text" class="form-control" placeholder="Department Name" name="name" id="name" form="editDepartmentForm-${id}" required></input></div></td>
            <td>${department.members
              .map(
                (member) =>
                  `<span class="badge badge-secondary m-1">${member.firstName} ${member.lastName}</span>`
              )
              .join("")}</td>
            <td>
            <div class="form-actions"><button class="btn btn-outline-success" type="submit" form="editDepartmentForm-${id}">Save</a>
            <button class="m-1 btn btn-outline-secondary" onclick="resetRow(${id})">Cancel</a></div>
            </td>
    `);

  $(`#editDepartmentForm-${id}`).submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: "/api/departments",
      type: "post",
      data: $(`#editDepartmentForm-${id}`).serialize(),
      error: function (data) {
        //Display error
        $("#alert").html(showAlert(data.responseJSON));
      },
      success: function (data) {
        //Display success
        $("#alert").html(showAlert(data));
        resetRow(id);
      },
    });
  });
}

$(document).ready(function () {
  renderPage();
});
