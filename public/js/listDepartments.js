//Object containing the list of departments

var data = departmentsList;

console.log(data);

//pagination of list of departments
function displayPaginatedContent() {
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
        dataHtml += `            <tr>
                  <td>${item.name}</td>
                  <td>${item.members
                    .map(
                      (member) =>
                        `<span class="badge badge-secondary m-1">${member.firstName} ${member.lastName}</span>`
                    )
                    .join("")}</td>
                  <td><a href="#" class="btn btn-outline-info"><i class="fas fa-ellipsis-h"></i></a></td>
              </tr>`;
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
      dataHtml += `            <tr>
      <td>${item.name}</td>
      <td>${item.members
        .map(
          (member) =>
            `<span class="badge badge-secondary m-1">${member.firstName} ${member.lastName}</span>`
        )
        .join("")}</td>
      <td><a href="#" class="btn btn-outline-info"><i class="fas fa-ellipsis-h"></i></a></td>
  </tr>`;
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
  displayPaginatedContent();
  $("#removeFiltersButton").hide();
  $("#search-input").val("");
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
        url: "/departments/submit",
        type: "post",
        data: $("#addDepartmentForm").serialize(),
        error: function (data) {
          console.log(data);
          var message = data.responseJSON;
          //Display error
          $("#alert")
            .html(`<div class="alert alert-danger  alert-dismissible fade show" role="alert">
          <strong>${message.title}!</strong> ${message.message}.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>`);
        },
        success: function (data) {
          console.log({ data });
          var department = data.data;
          //Display success
          $("#alert")
            .html(`<div class="alert alert-success  alert-dismissible fade show" role="alert">
          <strong>Success!</strong> Department <strong>${department.name}</strong> has been created.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>`);
          newDepartment();
        },
      });
    });
  } else {
    $("#addDepartment").remove();
  }
  button.toggleClass("active");
}

displayPaginatedContent();
