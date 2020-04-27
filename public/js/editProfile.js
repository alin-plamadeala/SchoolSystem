$(document).ready(function () {
  $("#changeEmail").prop("checked", false);

  $("#changeEmail").change(function () {
    if ($(this).prop("checked")) {
      $("#email").prop("readonly", false);
    } else {
      $("#email").prop("readonly", true);
    }
  });
});
function validateForm() {
  console.log("validation");
  email = $("#email");
  currentPassword = $("#currentPassword");
  newPassword = $("#newPassword");
  confirmPassword = $("#confirmPassword");

  email.removeClass("is-invalid");
  currentPassword.removeClass("is-invalid");
  newPassword.removeClass("is-invalid");
  confirmPassword.removeClass("is-invalid");
  $("#emailFb").text(``);
  $("#currentPasswordFb").text(``);
  $("#newPasswordFb").text(``);
  $("#confirmPasswordFb").text(``);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.val())) {
    email.addClass("is-invalid");
    $("#emailFb").text(`Invalid Email`);
    return false;
  }

  if (currentPassword.val() || newPassword.val() || confirmPassword.val()) {
    if (!currentPassword.val()) {
      currentPassword.addClass("is-invalid");
      $("#currentPasswordFb").text(`Please insert current password`);
      return false;
    } else if (!newPassword.val()) {
      newPassword.addClass("is-invalid");
      $("#newPasswordFb").text(`Please insert the new password`);
      return false;
    } else if (!confirmPassword.val()) {
      confirmPassword.addClass("is-invalid");
      $("#confirmPasswordFb").text(`Please confirm the new password`);
      return false;
    } else if (newPassword.val().length < 6) {
      newPassword.addClass("is-invalid");
      $("#newPasswordFb").text(`Password too short`);
      return false;
    } else if (newPassword.val() != confirmPassword.val()) {
      confirmPassword.addClass("is-invalid");
      $("#confirmPasswordFb").text(`Passwords don't match`);
      return false;
    }
  }
  return true;
}
