//Object containing the list of courses

var data = courseList;

console.log(data);

//html to display an course
function renderItem(item) {
  html = `<tr id="${item.id}">
        <td>${item.name}</td>
        <td>${item.teacher.firstName} ${item.teacher.lastName}</td>
        <td>
        <button type="button" onclick="removeCourse(${item.id})" class="btn btn-danger">Delete</button>
        <button type="button" onclick="editCourse(${item.id})"class="btn btn-info">Edit</button>
        </td>
    </tr>`;
  return html;
}

//pagination of list of courses
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
        dataHtml += renderItem(item);
      });
      container = $("#tbody");
      container.html(dataHtml);
    },
  });
}
//Search course by name
function search() {
  var input = {
    name: $("#search-input").val().toLowerCase(),
    teacher: $("#selectTeacher").val(),
    group: $("#selectGroup").val(),
  };
  console.log(input.name);
  console.log(input.teacher);
  console.log(input.group);

  var result = courseList.filter(function (course) {
    if (input)
      if (
        course.name.toLowerCase().indexOf(input.name) != -1 &&
        (course.teacher.id == input.teacher || input.teacher == "") &&
        (course.groups.filter((group) => group.id === parseInt(input.group))
          .length > 0 ||
          input.group == "")
      ) {
        return true;
      }
  });
  result;
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += renderItem(item);
    });
  } else {
    dataHtml = `<p>No courses found</p>`;
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
  $("#selectGroup").val("");
  $("#selectTeacher").val("");
}
//Display form to add a course
function newCourse() {
  //Add course form html
  const form = `
<tr id="addCourse">
    <form  id="addCourseForm"></form>
        <td><div class="control-group"><input type="text" class="form-control" placeholder="Course Name" name="name" id="name" form="addCourseForm" required></input></div></td>
        <td><div class="control-group"><select class="form-control" placeholder="Teacher" name="teacherId" id="teacherId" form="addCourseForm" data-live-search="true" required>
        <option value="" selected disabled hidden>Choose Teacher</option>
        ${teachersList
          .map(
            (item) =>
              `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
          )
          .join("")}
            </select></div></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" name="group" id="group" form="addCourseForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
</tr>`;
  const button = $("#addCourseButton");
  const container = $("#tbody");
  if ($("#addCourse").length === 0) {
    container.prepend(form);
    $("#teacherId").selectpicker({
      style: "btn-default",
      virtualScroll: true,
    });
    //Form post action
    $("#addCourseForm").submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: "/courses/submit",
        type: "post",
        data: $("#addCourseForm").serialize(),
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
          var course = data.data;
          //Display success
          $("#alert")
            .html(`<div class="alert alert-success  alert-dismissible fade show" role="alert">
          <strong>Success!</strong> Course <strong>${course.name}</strong> has been created.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>`);
          newCourse();
        },
      });
    });
  } else {
    $("#addCourse").remove();
  }
  button.toggleClass("active");
}

//remove Course
function removeCourse(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    $.ajax({
      url: `/courses/remove/${id}`,
      type: "DELETE",
      success: function (result) {
        console.log(result);
      },
    });
    $(`#${id}`).hide();
  }
}

//edit Course
function editCourse(id) {
  var course;
  $.ajax({
    url: `/courses/get/${id}`,
    type: "GET",
    success: function (result) {
      course = result;
      if (course) {
        $(`#${id}`).html(`
            <form id="editCourseForm-${id}"></form>
            <input type="hidden" id="id" name="id" value="${id}" form="editCourseForm-${id}">
            <td><div class="control-group"><input value="${
              course.name
            }" type="text" class="form-control" placeholder="Course Name" name="name" id="name" form="editCourseForm-${id}" required></input></div></td>
            <td><div class="control-group"><select class="teacherId form-control" placeholder="Teacher" name="teacherId" id="teacherId" form="editCourseForm-${id}" data-live-search="true" required>
            ${teachersList
              .map((item) =>
                item.id == course.teacher.id
                  ? `<option selected value="${item.id}">${item.firstName} ${item.lastName}</option>`
                  : `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
              )
              .join("")}
                </select></div></td>
            <td>
            <div class="form-actions"><button class="btn btn-outline-success" type="submit" form="editCourseForm-${id}">Save</a>
            <button class="m-1 btn btn-outline-secondary" onclick="resetRow(${id})" >Cancel</a></div>
            </td>
    
    `);
        $(".teacherId").selectpicker({
          style: "btn-default",
          virtualScroll: true,
        });
      }

      $(`#editCourseForm-${id}`).submit(function (e) {
        e.preventDefault();
        $.ajax({
          url: "/courses/submit",
          type: "post",
          data: $(`#editCourseForm-${id}`).serialize(),
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
            var user = data.data;
            //Display success
            $("#alert")
              .html(`<div class="alert alert-success  alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Course updated!
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
  var user;
  $.ajax({
    url: `courses/get/${id}`,
    type: "GET",
    success: function (result) {
      user = result;
      $(`#${id}`).html(`
      <td>${user.name}</td>
      <td>${user.teacher.firstName} ${user.teacher.lastName}</td>
      <td>
      <button type="button" onclick="removeCourse(${id})" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editCourse(${id})"class="btn btn-info">Edit</button>
      </td>`);
    },
  });
}

$("#selectTeacher").append(
  `${teachersList
    .map(
      (item) =>
        `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
    )
    .join("")}`
);

$("#selectGroup").append(
  `${groupsList
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("")}`
);
displayPaginatedContent();
$(function () {
  $("select").selectpicker({ style: "btn-outline-secondary" });
});
