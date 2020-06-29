var courseList;
var teachersList;
var groupsList;

async function renderPage() {
  //get the courses
  await $.get("api/courses", (data) => {
    courseList = data;
  });
  // get the teachers
  await $.get("api/teachers", (data) => {
    teachersList = data;
  });
  //get the groups
  await $.get("api/groups", (data) => {
    groupsList = data;
  });

  // Display number of groups
  $("#groupsNum").text(groupsList.length);

  $("#selectCourse").append(
    `${courseList
      .map(
        (item) =>
          `<option value="${item.id}" data-subtext="${item.teacher.firstName} ${item.teacher.lastName}">${item.name}</option>`
      )
      .join("")}`
  );

  $("#selectTeacher").append(
    `${teachersList
      .map(
        (item) =>
          `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
      )
      .join("")}`
  );

  // display the content
  displayPaginatedContent(groupsList);

  $("select").selectpicker({ style: "btn-outline-secondary" });
}

//html to display group
function renderItem(item) {
  html = `
  <tr id="${item.id}">
  <td>${item.name}</td>
  <td>${item.courses
    .map(
      (course) =>
        `<a class="btn btn-secondary btn-sm  m-1" href="#">
        ${course.name} <span class="badge badge-light">${course.teacher.firstName} ${course.teacher.lastName}
        </span></a>`
    )
    .join(" ")}
    </td>
  <td>
  <button type="button" onclick="removeGroup(${
    item.id
  })" class="btn btn-danger">Delete</button>
  <button type="button" onclick="editGroup(${
    item.id
  })"class="btn btn-info">Edit</button>
  </td>
</tr>
  `;
  return html;
}

//Refresh row
function resetRow(id) {
  $.ajax({
    url: `/api/groups/${id}`,
    type: "GET",
    success: function (result) {
      $(`#${id}`).replaceWith(renderItem(result));
    },
  });
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

//pagination of list of groups
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
        dataHtml += renderItem(item);
      });
      container = $("#tbody");
      container.html(dataHtml);
    },
  });
}

//Search group
function search() {
  var input = {
    name: $("#search-input").val().toLowerCase(),
    course: $("#selectCourse").val(),
    teacher: $("#selectTeacher").val(),
  };

  var result = groupsList.filter(function (group) {
    if (input)
      if (
        //search by name
        group.name.toLowerCase().indexOf(input.name) != -1 &&
        //search by course
        (group.courses.filter((course) => course.id === parseInt(input.course))
          .length > 0 ||
          input.course == "") &&
        //search by teacher
        (group.courses.filter(
          (course) => course.teacher.id === parseInt(input.teacher)
        ).length > 0 ||
          input.teacher == "")
      ) {
        return true;
      }
  });
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += renderItem(item);
    });
  } else {
    dataHtml = `<p>No groups found</p>`;
  }

  $("#pagination").pagination("hide");
  $("#removeFiltersButton").show();

  container = $("#tbody");
  container.html(dataHtml);
}

//Remove search filters
function removeFilters() {
  displayPaginatedContent(groupsList);
  $("#removeFiltersButton").hide();
  $("#search-input").val("");
  $("#selectCourse").val("");
  $("#selectTeacher").val("");
  $("select").selectpicker({ style: "btn-outline-secondary" });
}

//Display form to add a group
function newGroup() {
  const form = `
<tr id="addGroup">
    <form  id="addGroupForm"></form><input type="hidden" id="role" name="role" value="student" form="addGroupForm">
        <td><div class="control-group"><input type="text" class="form-control" placeholder="Group Name" name="name" id="name" form="addGroupForm" required></input></div></td>
        <td><div class="control-group"><select class="form-control" placeholder="Courses" name="courses" id="courseSelect" form="addGroupForm" data-live-search="true"   required multiple >
        ${courseList
          .map(
            (item) =>
              `<option value="${item.id}" data-subtext="${item.teacher.firstName} ${item.teacher.lastName}">${item.name}</option>`
          )
          .join("")}
            </select></div></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" name="group" id="group" form="addGroupForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
</tr>`;

  const button = $("#addGroupButton");
  const container = $("#tbody");
  if ($("#addGroup").length === 0) {
    container.prepend(form);
    $("#courseSelect").selectpicker({
      style: "btn-default",
      virtualScroll: true,
    });
    //Form post action
    $("#addGroupForm").submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: "/api/groups",
        type: "post",
        data: $("#addGroupForm").serialize(),
        error: function (data) {
          //Display error
          $("#alert").html(showAlert(data.responseJSON));
        },
        success: function (data) {
          //Display success
          $("#alert").html(showAlert(data));
          newGroup();
          renderPage();
        },
      });
    });
  } else {
    $("#addGroup").remove();
  }
  button.toggleClass("active");
}

//remove group
function removeGroup(id) {
  if (confirm("Are you sure you want to delete this Group?")) {
    $.ajax({
      url: `/api/groups/${id}`,
      type: "DELETE",
      success: function (result) {
        //Display success
        $("#alert").html(showAlert(result));
        newGroup();
      },
    });
    renderPage();
  }
}

//edit group
function editGroup(id) {
  var group = groupsList.filter((group) => group.id == id).pop();

  $(`#${id}`).html(`
            <form id="editGroupForm-${id}"></form>
            <input type="hidden" id="id" name="id" value="${id}" form="editGroupForm-${id}">
            <td><div class="control-group"><input value="${
              group.name
            }" type="text" class="form-control" placeholder="Group Name" name="name" id="name" form="editGroupForm-${id}" required></input></div></td>
        <td><div class="control-group"><select class="courseSelect form-control" placeholder="Courses" name="courses" id="courseSelect" form="editGroupForm-${id}" data-live-search="true"   required multiple >
        ${courseList
          .map((item) =>
            group.courses.map((course) => course.id).includes(item.id)
              ? `<option selected value="${item.id}" data-subtext="${item.teacher.firstName} ${item.teacher.lastName}">${item.name}</option>`
              : `<option value="${item.id}" data-subtext="${item.teacher.firstName} ${item.teacher.lastName}">${item.name}</option>`
          )
          .join("")}
            </select></div></td>
        <td>
        <div class="form-actions"><button class="btn btn-outline-success" type="submit" form="editGroupForm-${id}">Save</a>
        <button class="m-1 btn btn-outline-secondary" onclick="resetRow(${id})" >Cancel</a></div>
        </td>
        
    `);
  $(".courseSelect").selectpicker({
    style: "btn-default",
    virtualScroll: true,
  });

  $(`#editGroupForm-${id}`).submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: "/api/groups",
      type: "post",
      data: $(`#editGroupForm-${id}`).serialize(),
      error: function (data) {
        //Display error
        $("#alert").html(showAlert(data.responseJSON));
      },
      success: function (data) {
        $("#alert").html(showAlert(data));
        resetRow(id);
      },
    });
  });
}

$(function () {
  renderPage();
});
