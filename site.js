function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      } 
      xhttp.open("GET", file, true);
      xhttp.send();
      
      /*exit the function:*/
      return;
    }
  }
}

$(document).ready(function () {

  $("#sidebar").mCustomScrollbar({
      theme: "minimal"
  });

  // when opening the sidebar
  $('#sidebarCollapse').on('click', function () {
      // open sidebar
      $('#sidebar').addClass('active');
      // fade in the overlay
      $('.overlay').fadeIn();
      $('.collapse.in').toggleClass('in');
      $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  });


  // if dismiss or overlay was clicked
  $('#dismiss, .overlay').on('click', function () {
    // hide the sidebar
    $('#sidebar').removeClass('active');
    // fade out the overlay
    $('.overlay').fadeOut();
  });

  includeHTML();  
});
