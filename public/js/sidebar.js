$(document).ready(function () {
  $("#sidebar").mCustomScrollbar({
    theme: "minimal",
  });
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar, #right").toggleClass("active");
    $(".collapse.in").toggleClass("in");
    $("a[aria-expanded=true]").attr("aria-expanded", "false");
  });
  $("#sidebarCollapse2").on("click", function () {
    $("#sidebar, #right").toggleClass("active");
    $(".collapse.in").toggleClass("in");
    $("a[aria-expanded=true]").attr("aria-expanded", "false");
  });

  //Make active and expand the curent item on side menu
  var loc = window.location.pathname;
  // add active atribute to current location
  $("#sidebar")
    .find("a")
    .each(function () {
      $(this)
        .parent()
        .toggleClass("active", $(this).attr("href") == loc);
    });

  // expand menu for current location
  $("#sidebar")
    .find("ul.collapse > li.active")
    .each(function () {
      $(this)
        .parent()
        .addClass("show")
        .siblings()
        .attr("aria-expanded", "true");
      $(this)
        .parent()
        .parent()
        .parent()
        .addClass("show")
        .siblings()
        .attr("aria-expanded", "true");
    });
});
