'use strict';

describe('Directive: beleditForgetPasswordPanel', function () {

  // load the directive's module
  beforeEach(module('belPlus2App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<beledit-forget-password-panel></beledit-forget-password-panel>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the beleditForgetPasswordPanel directive');
  }));
});
