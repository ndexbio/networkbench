'use strict';

describe('Service: belModelService', function () {

  // load the service's module
  beforeEach(module('belPlus2App'));

  // instantiate service
  var belModelService;
  beforeEach(inject(function (_belModelService_) {
    belModelService = _belModelService_;
  }));

  it('should do something', function () {
    expect(!!belModelService).toBe(true);
  });

});