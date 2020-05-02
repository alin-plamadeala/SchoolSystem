//Object containing the list of users
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
        dataHtml += `            <tr>
                  <td>${item.fullName}</td>
                  <td>${item.email}</td>
                  <td>${item.group}</td>
                  <td><a href="#" class="btn btn-outline-info"><i class="fas fa-ellipsis-h"></i></a></td>
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
    if (student.fullName.toLowerCase().indexOf(input.name) != -1) {
      return true;
    }
  });
  result;
  var dataHtml;
  if (result.length) {
    $.each(result, function (index, item) {
      dataHtml += `            <tr>
                    <td>${item.fullName}</td>
                    <td>${item.email}</td>
                    <td>${item.group}</td>
                    <td><a href="#" class="btn btn-outline-info"><i class="fas fa-ellipsis-h"></i></a></td>
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
        <td><div class="control-group"><select class="form-control" required>
                <option>Group 1</option>
                <option>Group 2</option>
                <option>Group 3</option>
            </select></div></td>
        <td><div class="form-actions"><button class="btn btn-outline-success" type="submit" name="group" id="group" form="addUserForm"><i class="fa fa-plus" aria-hidden="true"></i></a></div></td>
    
</tr>`;
  const button = $("#addUserButton");
  const container = $("#tbody");
  if ($("#addUser").length === 0) {
    container.prepend(form);
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

displayPaginatedContent();
