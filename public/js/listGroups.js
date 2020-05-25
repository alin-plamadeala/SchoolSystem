//Object containing the list of users

var data = groupsList;

console.log(data);
//pagination of list of groups
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
        dataHtml += `            <tr id="${item.id}">
                  <td>${item.name}</td>
                  <td>${item.courses
                    .map(
                      (course) =>
                        `<a class="btn btn-secondary btn-sm  m-1" href="#">${course.name} <span class="badge badge-light">${course.teacher.firstName} ${course.teacher.lastName}</span></a>`
                    )
                    .join(" ")}</td>
                  <td>
                  <button type="button" onclick="removeGroup(${
                    item.id
                  })" class="btn btn-danger">Delete</button>
                  <button type="button" onclick="editGroup(${
                    item.id
                  })"class="btn btn-info">Edit</button>
                  </td>
              </tr>`;
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
        group.name.toLowerCase().indexOf(input.name) != -1 &&
        (group.courses.filter((course) => course.id === parseInt(input.course))
          .length > 0 ||
          input.course == "") &&
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
      dataHtml += `            <tr id="${item.id}">
      <td>${item.name}</td>
      <td>${item.courses
        .map(
          (course) =>
            `<a class="btn btn-secondary btn-sm  m-1" href="#">${course.name} <span class="badge badge-light">${course.teacher.firstName} ${course.teacher.lastName}</span></a>`
        )
        .join(" ")}</td>
      <td>
      <button type="button" onclick="removeGroup(${
        item.id
      })" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editGroup(${
        item.id
      })"class="btn btn-info">Edit</button>
      </td>
  </tr>`;
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
  displayPaginatedContent();
  $("#removeFiltersButton").hide();
  $("#search-input").val("");
  $("#selectCourse").val("");
  $("#selectTeacher").val("");
}

//Display form to add a group
function newGroup() {
  const form = `
<tr id="addGroup">
    <form  id="addGroupForm"></form><input type="hidden" id="role" name="role" value="${role}" form="addGroupForm">
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
        url: "/groups/submit",
        type: "post",
        data: $("#addGroupForm").serialize(),
        error: function (data) {
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
          var group = data.data;
          //Display success
          $("#alert")
            .html(`<div class="alert alert-success  alert-dismissible fade show" role="alert">
          <strong>Success!</strong> Group <strong>${group.name}</strong> has been created.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>`);
          newGroup();
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
      url: `/groups/remove/${id}`,
      type: "DELETE",
      success: function (result) {
        console.log(result);
      },
    });
    $(`#${id}`).hide();
  }
}

//edit group
function editGroup(id) {
  var group;
  $.ajax({
    url: `/groups/get/${id}`,
    type: "GET",
    success: function (result) {
      group = result;
      if (group) {
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
      }

      $(`editGroupForm-${id}`).submit(function (e) {
        e.preventDefault();
        $.ajax({
          url: "/groups/submit",
          type: "post",
          data: $(`editGroupForm-${id}`).serialize(),
          error: function (data) {
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
            var group = data.data;
            //Display success
            $("#alert")
              .html(`<div class="alert alert-success  alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Group updated!
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`);
            resetRow(id);
          },
        });
      });
    },
  });
}

//Refresh row
function resetRow(id) {
  var group;
  $.ajax({
    url: `groups/get/${id}`,
    type: "GET",
    success: function (result) {
      group = result;
      $(`#${id}`).html(`
      <td>${group.name}</td>
      <td>${group.courses
        .map(
          (course) =>
            `<a class="btn btn-secondary btn-sm  m-1" href="#">${course.name} <span class="badge badge-light">${course.teacher.firstName} ${course.teacher.lastName}</span></a>`
        )
        .join(" ")}</td>
      <td>
      <button type="button" onclick="removeGroup(${
        group.id
      })" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editGroup(${
        group.id
      })"class="btn btn-info">Edit</button>
      </td>`);
    },
  });
}

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
displayPaginatedContent();
$(function () {
  $("select").selectpicker({ style: "btn-outline-secondary" });
});
