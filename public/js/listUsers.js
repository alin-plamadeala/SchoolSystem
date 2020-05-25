//Object containing the list of users
userList.forEach((user) => {
  user.fullName = `${user.firstName} ${user.lastName}`;
});
var data = userList;

//pagination of list of users
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
        if (!item.group) {
          item.group = "undefined";
        }
        dataHtml += `           <tr id="${item.id}">
                  <td>${item.fullName}</td>
                  <td>${item.email}</td>
                  <td>${item.group.name}</td>
                  <td>
                  <button type="button" onclick="removeUser(${item.id})" class="btn btn-danger">Delete</button>
                  <button type="button" onclick="editUser(${item.id})"class="btn btn-info">Edit</button>
                  </td>
              </tr>`;
      });
      container = $("#tbody");
      container.html(dataHtml);
    },
  });
}
//Search user by name
function search() {
  var input = {
    name: $("#search-input").val().toLowerCase(),
    group: $("#selectGroup").val(),
  };
  //todo include group parameter in search
  console.log(input.group);
  var result = userList.filter(function (student) {
    if (
      student.fullName.toLowerCase().indexOf(input.name) != -1 &&
      (student.group.id === parseInt(input.group) || input.group == "")
    ) {
      return true;
    }
  });
  result;
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += `            <tr id="${item.id}">
                    <td>${item.fullName}</td>
                    <td>${item.email}</td>
                    <td>${item.group.name}</td>
                    <td>                  
                    <button type="button" onclick="removeUser(${item.id})" class="btn btn-danger">Delete</button>
                    <button type="button" onclick="editUser(${item.id})"class="btn btn-info">Edit</button></td>
                </tr>`;
    });
  } else {
    dataHtml = `<p>No users found</p>`;
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
}
//Display form to add a user
function newUser() {
  const form = `             <tr id="addUser">
    <form  id="addUserForm"></form><input type="hidden" id="role" name="role" value="${role}" form="addUserForm">
        <td><div class="control-group"><input type="text" class="form-control" placeholder="Full Name" name="fullName" id="fullName" form="addUserForm" required></input></div></td>
        <td><div class="control-group"><input type="email" class="form-control" placeholder="Email" name="email" id="email" form="addUserForm" required> </div></td>
        <td><div class="control-group"><select class="form-control" placeholder="Group" name="group" id="groupSelect" form="addUserForm" data-live-search="true" required>
        <option value="" selected hidden></option>
        ${groupsList
          .map((item) => `<option value="${item.id}">${item.name}</option>`)
          .join("")}
            </select></div></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" form="addUserForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
    
</tr>`;
  const button = $("#addUserButton");
  const container = $("#tbody");
  if ($("#addUser").length === 0) {
    container.prepend(form);
    $("#groupSelect").selectpicker({
      style: "btn-default",
      virtualScroll: true,
    });
    //Form post action
    $("#addUserForm").submit(function (e) {
      e.preventDefault();
      $.ajax({
        url: "/users/submit",
        type: "post",
        data: $("#addUserForm").serialize(),
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
          <strong>Success!</strong> A new account has been created. Authentication details have been sent to ${user.email}.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>`);
          newUser();
        },
      });
    });
  } else {
    $("#addUser").remove();
  }
  button.toggleClass("active");
}
//remove an user
function removeUser(id) {
  if (confirm("Are you sure you want to delete this account?")) {
    $.ajax({
      url: `./remove/${id}`,
      type: "DELETE",
      success: function (result) {
        console.log(result);
      },
    });
    $(`#${id}`).hide();
  }
}
//edit an user
function editUser(id) {
  var user;
  $.ajax({
    url: `./get/${id}`,
    type: "GET",
    success: function (result) {
      user = result;
      if (user) {
        $(`#${id}`).html(`
            <form id="editUserForm-${id}"></form>
            <input type="hidden" id="id" name="id" value="${id}" form="editUserForm-${id}">
            <td><div class="control-group"><input type="text" class="form-control" placeholder="Full Name" name="fullName" id="fullName" form="editUserForm-${id}" value="${
          user.firstName
        } ${user.lastName}" required></input></div></td>
            <td><div class="control-group"><input type="email" class="form-control" placeholder="Email" name="email" id="email" form="editUserForm-${id}" value="${
          user.email
        }" required> </div></td>
            <td><div class="control-group"><select class="form-control groupSelect" placeholder="Group" name="group" id="groupSelect" form="editUserForm-${id}" data-live-search="true" required>
            ${groupsList
              .map((item) =>
                item.id == user.groupId
                  ? `<option selected value="${item.id}">${item.name}</option>`
                  : `<option value="${item.id}">${item.name}</option>`
              )
              .join("")}
                </select></div></td>
            <td>
            <div class="form-actions"><button class="btn btn-outline-success" type="submit" form="editUserForm-${id}">Save</a>
            <button class="m-1 btn btn-outline-secondary" onclick="resetRow(${id})" >Cancel</a></div>
            </td>
    `);
        $(".groupSelect").selectpicker({
          style: "btn-default",
          virtualScroll: true,
        });
      }

      $(`editUserForm-${id}`).submit(function (e) {
        e.preventDefault();
        $.ajax({
          url: "/users/submit",
          type: "post",
          data: $(`editUserForm-${id}`).serialize(),
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
            <strong>Success!</strong> User updated!
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
    url: `./get/${id}`,
    type: "GET",
    success: function (result) {
      user = result;
      $(`#${id}`).html(`<td>${user.firstName} ${user.lastName}</td>
      <td>${user.email}</td>
      <td>${user.group.name}</td>
      <td>                  
      <button type="button" onclick="removeUser(${user.id})" class="btn btn-danger">Delete</button>
      <button type="button" onclick="editUser(${user.id})"class="btn btn-info">Edit</button></td>`);
    },
  });
}
//config to parse csv files
config = {
  delimiter: "", // auto-detect
  newline: "", // auto-detect
  quoteChar: '"',
  escapeChar: '"',
  header: false,
  transformHeader: undefined,
  dynamicTyping: false,
  preview: 0,
  encoding: "",
  worker: false,
  comments: false,
  step: undefined,
  complete: function (results, file) {
    console.log("Parsing complete:", results, file);
    csvResult = [...results.data];
    csvError = [...results.errors];
    //remove header
    csvResult.shift();
  },
  error: undefined,
  download: false,
  downloadRequestHeaders: undefined,
  downloadRequestBody: undefined,
  skipEmptyLines: true,
  chunk: undefined,
  fastMode: undefined,
  beforeFirstChunk: undefined,
  withCredentials: undefined,
  transform: undefined,
  delimitersToGuess: [",", "\t", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP],
};
//uploaded file
let file;
//parse results
let csvResult;
//parse error
let csvError;

//parse results when upload a file
function handleUpload() {
  csvResult = null;
  csvError = null;
  $("#errors").html("");
  $("#results").html("");

  $("#addUserList").hide();
  $("#processButton").show();
  file = $("#csvFile").prop("files")[0];
  Papa.parse(file, config);
}

//clear value on click
$("#csvFile").click(function () {
  $(this).val("");
});

//display parsed file
function showParseResults() {
  let htmlData;
  if (csvError.length != 0) {
    //display error
    $("#errors").html(`<div class="alert alert-danger" role="alert">
An error occured while processing the file.
</div>`);
  } else {
    //remove empty rows
    for (var i = 0; i < csvResult.length; i++) {
      if (csvResult[i][0].length === 0 && csvResult[i][1].length === 0) {
        csvResult.splice(i, 1);
        i--;
      }
    }
    //display table rows
    for (var i = 0; i < csvResult.length; i++) {
      htmlData += `<tr id="user${i}">
  <th scope="row">${i + 1}</th>
  <td>${csvResult[i][0]}</td>
  <td>${csvResult[i][1]}</td>
  </tr>`;
    }

    $("#results").html(htmlData);
    //show submit button
    $("#addUserList").show();
  }
}

//Post parsed file
$("#addUserList").click(function (e) {
  e.preventDefault();
  $.ajax({
    url: "/users/submitList",
    type: "post",
    data: { csvResult, role, group: parseInt($("#csvGroupSelect").val()) },
    error: function (data) {
      console.log(data);
      const errors = data.responseJSON.errors;
      for (var i = 0, len = errors.length; i < len; i++) {
        $(`#user${errors[i].index}`)
          .addClass("table-danger")
          .append(`<td id="err">${errors[i].error}</td>`);
      }
      $("#addUserList").hide();
    },
    success: function (data) {
      console.log(data);
      $("#results").addClass("table-success");
      $(".modal-body").prepend(`<div class="alert alert-success" role="alert">
      Users succesfully imported!
    </div>`);
      $("#addUserList").hide();
    },
  });
});

displayPaginatedContent();
$(function () {
  $("select").selectpicker({ style: "btn-outline-secondary" });
});
$("#selectGroup").append(
  `${groupsList
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("")}`
);
$("#csvGroupSelect").append(
  `${groupsList
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("")}`
);
