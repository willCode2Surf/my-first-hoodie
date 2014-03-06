!function ($) {

  'use strict';

  // extend ARMT with Hoodstrap module
  ARMT.extend(function(armt) {

    // Constructor
    function Hoodstrap(armt) {

      this.armt = armt;

      // all about authentication and stuff
      this.armtifyAccountBar();
    }

    Hoodstrap.prototype = {

      //
      armtifyAccountBar: function() {
        this.subscribeToARMTEvents();
        this.armt.account.authenticate().then(this.handleUserAuthenticated.bind(this), this.handleUserUnauthenticated.bind(this));
      },

      subscribeToARMTEvents : function() {
        this.armt.account.on('signin reauthenticated', this.handleUserAuthenticated.bind(this));
        this.armt.account.on('signout', this.handleUserUnauthenticated.bind(this));
        this.armt.on('account:error:unauthenticated remote:error:unauthenticated', this.handleUserAuthenticationError.bind(this));
      },

      //
      handleUserAuthenticated: function(username) {
        $('html').attr('data-armt-account-status', 'signedin');
        $('.armt-accountbar').find('.armt-username').text(username);
      },

      //
      handleUserUnauthenticated: function() {
        $('html').attr('data-armt-account-status', 'signedout');
      },
      handleUserAuthenticationError: function() {
        $('.armt-accountbar').find('.armt-username').text(this.armt.account.username);
        $('html').attr('data-armt-account-status', 'error');
      }
    };

    new Hoodstrap(armt);
  });

 /* ARMT DATA-API
  * =============== */

  $(function () {

    // bind to click events
    $('body').on('click.armt.data-api', '[data-armt-action]', function(event) {
      var $element = $(event.target),
          action   = $element.data('armt-action'),
          $form;

      switch(action) {
        case 'signup':
          $form = $.modalForm({
            fields: [ 'username', 'password', 'password_confirmation' ],
            submit: 'Sign Up'
          });
          break;
        case 'signin':
          $form = $.modalForm({
            fields: [ 'username', 'password' ],
            submit: 'Sign in'
          });
          break;
        case 'resetpassword':
          $form = $.modalForm({
            fields: [ 'username' ],
            submit: 'Reset Password'
          });
          break;
        case 'changepassword':
          $form = $.modalForm({
            fields: [ 'current_password', 'new_password' ],
            submit: 'Reset Password'
          });
          break;
        case 'changeusername':
          $form = $.modalForm({
            fields: [ 'current_password', 'new_username' ],
            submit: 'Reset Password'
          });
          break;
        case 'signout':
          window.armt.account.signOut();
          break;
        case 'destroy':
          if( window.confirm('you sure?') ) {
            window.armt.account.destroy();
          }
          break;
      }

      if ($form) {
        $form.on('submit', handleSubmit( action ));
      }
    });

    var handleSubmit = function(action) {
      return function(event, inputs) {

        var $modal = $(event.target);
        var magic;

        switch(action) {
          case 'signin':
            magic = window.armt.account.signIn(inputs.username, inputs.password);
            break;
          case 'signup':
            magic = window.armt.account.signUp(inputs.username, inputs.password);
            break;
          case 'changepassword':
            magic = window.armt.account.changePassword(null, inputs.new_password);
            break;
          case 'changeusername':
            magic = window.armt.account.changeUsername(inputs.current_password, inputs.new_username);
            break;
          case 'resetpassword':
            magic = window.armt.account.resetPassword(inputs.email)
            .done(function() {
              window.alert('send new password to ' + inputs.email);
            });
            break;
        }

        magic.done(function() {
          $modal.find('.alert').remove();
          $modal.modal('hide');
        });
        magic.fail(function(error) {
          $modal.find('.alert').remove();
          $modal.trigger('error', error);
        });
      };
    };
  });
}( window.jQuery )