var helper = (function() {
var BASE_API_PATH = 'plus/v1/';

return {
  /**
   * Function does the following:
   * 1. Hides the sign in button
   * 2. Calls the Profile and Pepole functions to display content.
   *
   * @param {Object} authResult - Object which contains the access token and
   *   other authentication information.
   */
  onSignInCallback: function(authResult) {
    gapi.client.load('plus','v1').then(function() {
      if (authResult['access_token']) {
        $('#authOps').show('slow');
        $('#gConnect').hide();
        helper.profile();
        helper.people();
      } else if (authResult['error']) {
        console.log('Error encountered: ' + authResult['error']);
        $('#authResult').append('Logged out');
        $('#authOps').hide('slow');
        $('#gConnect').show();
      }
      console.log('authResult', authResult);
    });
  },

  /**
   * Function calls the OAuth2 endpoint to disconnect the app for the user, and
   * displays the sign in button
   */
  disconnect: function() {
    // Revoke the access token.
    $.ajax({
      type: 'GET',
      url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
          gapi.auth.getToken().access_token,
      async: false,
      contentType: 'application/json',
      dataType: 'jsonp',
      success: function(result) {
        console.log('revoke response: ' + result);
        $('#authOps').hide();
        $('#profile').empty();
        $('#visiblePplTbl').empty();
        $('#authResult').empty();
        $('#gConnect').show();
      },
      error: function(e) {
        console.log(e);
      }
    });
  },

  /**
   * Function fetches and renders the list of people associated to the logged in
   * user.
   */
  people: function() {
    gapi.client.plus.people.list({
      'userId': 'me',
      'collection': 'visible'
    }).then(function(res) {
      var people = res.result;
      $('#visiblePplTbl > tbody').html("");
      $('#visiblePeople').append('User friends from Google+: <b>'
        + people.totalItems + '</b>');
      var userIdx = 1;
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        console.log("******* => " + JSON.stringify(person));

        var hangoutScriptTxt = "gapi.hangout.render('placeholder-div0-" + userIdx + "'," +
          " { " +
          "'render': 'createhangout', 'hangout_type': 'normal', 'widget_size': 72," +
          "'invites': [{ 'id' : '" + person.id + "' , 'invite_type' : 'PROFILE' }]" +
          " } );";

        var telephoneScriptTxt = "gapi.hangout.render('placeholder-div1-" + userIdx + "'," +
          " { " +
          "'render': 'createhangout', 'hangout_type': 'normal', 'widget_size': 72," +
          "'invites': [{ 'id' : '4089405294' , 'invite_type' : 'PHONE' }]" +
          " } );";

        $('#visiblePplTbl > tbody:last').append('<tr>' +
          '<td><a href="'+ person.url +'">'+ person.displayName + '</a></td>' +
          '<td><img src="' + person.image.url + '"></td>' +
          '<td><div id="placeholder-div0-'+ userIdx +'"></div></td>' +
          '<td><div id="placeholder-div1-'+ userIdx +'"></div></td>' +
          '</tr>');

        $('<script>').attr('type','text/javascript').text(hangoutScriptTxt + telephoneScriptTxt).appendTo('head');

        userIdx++;
      }
    });
  },

  /**
   * Function fetches and renders the currently signed in user's profile data.
   */
  profile: function(){
    gapi.client.plus.people.get({
      'userId': 'me'
    }).then(function(res) {
      var profile = res.result;
      $('#profile').empty();
      $('#userWelcome').append('Hello ' + profile.displayName + '!');
    }, function(err) {
      var error = err.result;
      $('#profile').empty();
      $('#profile').append(error.message);
    });
  }
};
})();

/**
* Page loading starts here ...
*/
$(document).ready(function() {
    $('#disconnect').click(helper.disconnect);
  });

/**
* Calls the helper method that handles the authentication flow.
*/
function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}
