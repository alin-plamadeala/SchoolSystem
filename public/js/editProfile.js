$(document).ready(function () {
  //uncheck the change email checkbox
  $("#changeEmail").prop("checked", false);

  //allow editing email when checkbox is checked
  $("#changeEmail").change(function () {
    if ($(this).prop("checked")) {
      $("#email").prop("readonly", false);
    } else {
      $("#email").prop("readonly", true);
    }
  });
});

// Validate input in edit profile form
function validateForm() {
  email = $("#email");
  currentPassword = $("#currentPassword");
  newPassword = $("#newPassword");
  confirmPassword = $("#confirmPassword");

  // remove existing invalid class from input fields
  email.removeClass("is-invalid");
  currentPassword.removeClass("is-invalid");
  newPassword.removeClass("is-invalid");
  confirmPassword.removeClass("is-invalid");
  $("#emailFb").text(``);
  $("#currentPasswordFb").text(``);
  $("#newPasswordFb").text(``);
  $("#confirmPasswordFb").text(``);

  // validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.val())) {
    email.addClass("is-invalid");
    $("#emailFb").text(`Invalid Email`);
    return false;
  }

  // validate password
  if (currentPassword.val() || newPassword.val() || confirmPassword.val()) {
    // if password empty
    if (!currentPassword.val()) {
      currentPassword.addClass("is-invalid");
      $("#currentPasswordFb").text(`Please insert current password`);
      return false;
      // if new password empty
    } else if (!newPassword.val()) {
      newPassword.addClass("is-invalid");
      $("#newPasswordFb").text(`Please insert the new password`);
      return false;
      // if confirm password is empty
    } else if (!confirmPassword.val()) {
      confirmPassword.addClass("is-invalid");
      $("#confirmPasswordFb").text(`Please confirm the new password`);
      return false;
      // if new password length < 6
    } else if (newPassword.val().length < 6) {
      newPassword.addClass("is-invalid");
      $("#newPasswordFb").text(`Password too short`);
      return false;
      // if passwords match
    } else if (newPassword.val() != confirmPassword.val()) {
      confirmPassword.addClass("is-invalid");
      $("#confirmPasswordFb").text(`Passwords don't match`);
      return false;
    }
  }
  return true;
}
