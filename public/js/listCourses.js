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

  // Display number of courses
  $("#courseNum").text(courseList.length);

  // teacher list inside teacher dropdown
  $("#selectTeacher").append(
    `${teachersList
      .map(
        (item) =>
          `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
      )
      .join("")}`
  );

  // groups list inside teacher dropdown
  $("#selectGroup").append(
    `${groupsList
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("")}`
  );
  // display the content
  displayPaginatedContent(courseList);

  $("select").selectpicker({ style: "btn-outline-secondary" });
}

//Refresh row
function resetRow(id) {
  var user;
  $.ajax({
    url: `/api/courses/${id}`,
    type: "GET",
    success: function (result) {
      $(`#${id}`).replaceWith(renderItem(result));
    },
  });
}

//html to display an course
function renderItem(item) {
  html = `
  <tr id="${item.id}">
      <td>${item.name}</td>
      <td>${item.teacher.firstName} ${item.teacher.lastName}</td>
      <td>
      <button type="button" onclick="removeCourse(${item.id})" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editCourse(${item.id})"class="btn btn-info">Edit</button>
      </td>
  </tr>
  `;
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

//pagination of list of courses
function displayPaginatedContent(data) {
  $("#pagination").pagination({
    dataSource: data,
    pageSize: 10,
    callback: function (data, pagination) {
      // add style to page numbers
      $(".paginationjs-pages > ul")
        .addClass("pagination justify-content-center")
        .children()
        .addClass("page-item")
        .children()
        .addClass("page-link");

      var dataHtml;
      // display each course
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
  // get the input from the search field and dropdown
  var input = {
    name: $("#search-input").val().toLowerCase(),
    teacher: $("#selectTeacher").val(),
    group: $("#selectGroup").val(),
  };

  // filter courses according to search parameters
  var result = courseList.filter(function (course) {
    // check if input exists
    if (input)
      if (
        // search by name
        course.name.toLowerCase().indexOf(input.name) != -1 &&
        // search by teacher
        (course.teacher.id == input.teacher || input.teacher == "") &&
        // search by group
        (course.groups.filter((group) => group.id === parseInt(input.group))
          .length > 0 ||
          input.group == "")
      ) {
        return true;
      }
  });

  // html for search result
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += renderItem(item);
    });
  } else {
    dataHtml = `<p>No courses found</p>`;
  }
  // hide pagination for search result
  $("#pagination").pagination("hide");
  // display the remove filters button
  $("#removeFiltersButton").show();

  // display search result
  container = $("#tbody");
  container.html(dataHtml);
}

//Remove search filters
function removeFilters() {
  displayPaginatedContent(courseList);
  $("#removeFiltersButton").hide();
  $("#search-input").val("");
  $("#selectGroup").val("");
  $("#selectTeacher").val("");
  $("select").selectpicker({ style: "btn-outline-secondary" });
}

//Form to add a course
function newCourse() {
  //Add course html
  const form = `
<tr id="addCourse">
    <form  id="addCourseForm"></form>
        <td><div class="control-group">
          <input type="text" class="form-control" placeholder="Course Name" name="name" id="name" form="addCourseForm" required></input>
        </div></td>
        <td><div class="control-group">
          <select class="form-control" placeholder="Teacher" name="teacherId" id="teacherId" form="addCourseForm" data-live-search="true" required>
            <option value="" selected disabled hidden>Choose Teacher</option>
              ${teachersList
                .map(
                  (item) =>
                    `<option value="${item.id}">${item.firstName} ${item.lastName}</option>`
                )
                .join("")}
          </select></div></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" name="group" id="group" form="addCourseForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
</tr>
`;
  // toggle form on button click
  const button = $("#addCourseButton");
  const container = $("#tbody");
  // if form is not displayed
  if ($("#addCourse").length === 0) {
    // prepend form html into the container
    container.prepend(form);
    $("#teacherId").selectpicker({
      style: "btn-default",
      virtualScroll: true,
    });
    //Form post action
    $("#addCourseForm").submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: "/api/courses",
        type: "post",
        data: $("#addCourseForm").serialize(),
        error: function (data) {
          //Display error
          $("#alert").html(showAlert(data.responseJSON));
        },
        success: function (data) {
          //Display success
          $("#alert").html(showAlert(data));
          newCourse();
          renderPage();
        },
      });
    });
  } else {
    // if form is displayed, remove it
    $("#addCourse").remove();
  }
  // toggle the button
  button.toggleClass("active");
}

//remove Course
function removeCourse(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    $.ajax({
      url: `/api/courses/${id}`,
      type: "DELETE",
      success: function (data) {
        //Display success
        $("#alert").html(showAlert(data));
        renderPage();
        // $(`#${id}`).hide();
      },
      error: function (data) {
        //Display error
        $("#alert").html(showAlert(data.responseJSON));
      },
    });
  }
}

//edit Course
function editCourse(id) {
  var course = courseList.filter((course) => course.id == id).pop();

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
            <button class="m-1 btn btn-outline-secondary" onclick="resetRow(${id})">Cancel</a></div>
            </td>
    `);
  $(".teacherId").selectpicker({
    style: "btn-default",
    virtualScroll: true,
  });

  $(`#editCourseForm-${id}`).submit(function (e) {
    e.preventDefault();
    $.ajax({
      url: "/api/courses",
      type: "post",
      data: $(`#editCourseForm-${id}`).serialize(),
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
