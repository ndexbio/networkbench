'use strict';

/**
 * @ngdoc service
 * @name netWorkBenchApp.ndexService
 * @description
 * # ndexService
 * Service in the netWorkBenchApp.
 */
angular.module('netWorkBenchApp')
  .service('ndexService', ['$http', '$q', function ($http, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function


    /*---------------------------------------------------------------------*
     * NDEx Server
     *---------------------------------------------------------------------*/

    var ndexServerUri = 'http://dev2.ndexbio.org/rest';
    //var ndexServerUri = 'http://public.ndexbio.org/rest';

    this.getNdexServerUri = function () {
      return ndexServerUri;
    };

    this.client = ndex;

    /*---------------------------------------------------------------------*
     * Networks
     *---------------------------------------------------------------------*/

    this.getNetworkSummary = function (networkId) {
      var url = '/network/' + networkId;
      var config = getGetConfig(url, null);
      return request(config);
    };

    this.searchNetworks = function (searchString, accountName, permission, includeGroups, skipBlocks, blockSize) {
      var url = '/network/search/' + skipBlocks.toString() + '/' + blockSize.toString();
      var postData = {searchString: searchString};
      if (accountName) {
        postData.accountName = accountName;
      }

      if (permission) {
        postData.permission = permission;
      }
      if (includeGroups) {
        postData.includeGroups = includeGroups;
      }

      var config = getPostConfig(url, postData);
      return request(config);
    };

    this.getNetworkByEdges = function (networkId, skipBlocks, blockSize) {
      var url = '/network/' + networkId + '/edge/asNetwork/' + skipBlocks + '/' + blockSize;
      var config = getGetConfig(url, null);
      return request(config);
    };

    this.getCompleteNetwork = function (networkId) {
      var url = '/network/' + networkId + '/asNetwork/';
      var config = getGetConfig(url, null);
      return request(config);
    };

    this.getNetworkAsCx = function (networkId) {
      var url = '/network/' + networkId + '/asCX';
      var config = getGetConfig(url, null);
      return request(config);
    };

    this.queryNetworkAsCX = function (networkId, searchString, searchDepth, edgeLimit) {
      var url = '/network/' + networkId + 'asCX/query';
      var postData = {
        searchString: searchString,
        searchDepth: searchDepth,
        edgeLimit: edgeLimit
      };
      var config = getPostConfig(url, postData);
      return request(config);
    };

    this.updateCXNetwork = function (networkId, cx, provenance) {
      var url = '/network/asCX/' + networkId;
      var putData = {
        CXNetworkStream: cx
      };
      if (provenance) {
        putData.provenance = provenance;
      }
      var config = getPutConfig(url, putData);
      return request(config);
    };

    this.createCXNetwork = function (cx) {
      var url = '/network/asCX/';
      var postData = {
        CXNetworkStream: cx
      };

      var config = {
        method: 'POST',
        url: ndexServerUri + url,

        // setting transformRequest to identity stops angular from serializing the postData
        transformRequest: angular.identity,

        data: postData,

        // setting Content-Type to undefined causes angular to correctly configure to multipart.
        headers: {'Content-Type': undefined}
      };
      addAuth(getEncodedUser(), config);

      return request(config);
    };

    // Query Network
    this.queryNetwork = function (networkId, startingTerms, searchDepth, edgeLimit) {
      var url = '/network/' + networkId + '/asNetwork/query/';
      var postData = {
        searchString: startingTerms,
        searchDepth: searchDepth,
        edgeLimit: edgeLimit
      };
      var config = getPostConfig(url, postData);
      return requestWithAbort(config);
    };

    // Set Network ReadOnly true/false
    var getNetworkSetReadOnlyConfig = function (networkId, value) {
      var url = '/network/' + networkId + '/setFlag/readOnly=' + value;
      return getGetConfig(url, null);
    };

    this.setNetworkReadOnly = function (networkId, value) {
      var config = getNetworkSetReadOnlyConfig(networkId, value);
      return requestWithAbort(config);
    };

    this.deleteNetwork = function (networkId) {
      var url = '/network/' + networkId;
      var config = getDeleteConfig(url);
      return requestWithAbort(config);
    };

    /*---------------------------------------------------------------------*
     * Authentication
     *---------------------------------------------------------------------*/

    var addAuth = function (encodedUser, config) {
      if (encodedUser) {
        config.headers.Authorization = 'Basic ' + getEncodedUser();
      }
      else {
        config.headers.Authorization = undefined;
      }
    };

    /*---------------------------------------------------------------------*
     * DELETE request configuration
     *---------------------------------------------------------------------*/

    var getDeleteConfig = function (url) {
      var config = {
        method: 'DELETE',
        url: ndexServerUri + url,
        headers: {
          //Authorization: 'Basic ' + factory.getEncodedUser()
        }
      };
      addAuth(getEncodedUser(), config);
      return config;
    };

    /*---------------------------------------------------------------------*
     * GET request configuration
     *---------------------------------------------------------------------*/

    var getGetConfig = function (url, queryArgs) {
      var config = {
        method: 'GET',
        url: ndexServerUri + url,
        headers: {
          //Authorization: 'Basic ' + factory.getEncodedUser()
        }
      };
      addAuth(getEncodedUser(), config);
      if (queryArgs) {
        config.data = JSON.stringify(queryArgs);
      }
      return config;
    };

    /*---------------------------------------------------------------------*
     * POST request configuration
     *---------------------------------------------------------------------*/

    var getPostConfig = function (url, postData) {
      var config = {
        method: 'POST',
        url: ndexServerUri + url,
        data: angular.toJson(postData),
        headers: {}
      };
      addAuth(getEncodedUser(), config);
      return config;
    };

    /*
     var getPostMultipartConfig = function (url, postData) {
     $http.post(uploadUrl, fd, {
     transformRequest: angular.identity,
     headers: {'Content-Type': undefined}
     })


     return config;

     };
     */

    /*---------------------------------------------------------------------*
     * PUT request configuration
     *---------------------------------------------------------------------*/
    var getPutConfig = function (url, data) {
      var config = {
        method: 'PUT',
        url: ndexServerUri + url,
        data: angular.toJson(data),
        headers: {}
      };
      addAuth(getEncodedUser(), config);
      return config;
    };


    /*-----------------------------------------------------------------------*
     * user credentials and ID
     *-----------------------------------------------------------------------*/

    this.clearUserCredentials = function () {
      localStorage.setItem('loggedInUser', null);
    };

    var checkLocalStorage = function () {
      return !localStorage ? false : true;
    };

    this.setUserCredentials = function (accountName, externalId, token) {
      var loggedInUser = {};
      loggedInUser.accountName = accountName;
      loggedInUser.token = token;
      loggedInUser.externalId = externalId;
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    };

    this.getUserCredentials = function () {
      if (checkLocalStorage()) {
        if (localStorage.loggedInUser) {
          var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
          if (loggedInUser === null) {
            return null;
          }
          return {
            accountName: loggedInUser.accountName,
            externalId: loggedInUser.externalId,
            token: loggedInUser.token
          };
        }
      }
    };

    this.setUserAuthToken = function (token) {
      var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        loggedInUser = {};
      }
      loggedInUser.token = token;
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    };

    this.setUserInfo = function (accountName, externalId) {
      var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        loggedInUser = {};
      }
      loggedInUser.accountName = accountName;
      loggedInUser.externalId = externalId;
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    };
    /*
     var getLoggedInUserExternalId = function () {
     var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
     if (!loggedInUser) {
     loggedInUser = {};
     }
     return loggedInUser.externalId;
     };
     */
    var getLoggedInUserAccountName = function () {
      var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        loggedInUser = {};
      }
      return loggedInUser.accountName;
    };

    var getLoggedInUserAuthToken = function () {
      var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        loggedInUser = {};
      }
      return loggedInUser.token;
    };

    /*---------------------------------------------------------------------*
     * Returns the user's credentials as required by Basic Authentication base64
     * encoded.
     *---------------------------------------------------------------------*/

    var getEncodedUser = function () {
      if (getLoggedInUserAccountName() !== undefined && getLoggedInUserAccountName() !== null) {
        return btoa(getLoggedInUserAccountName() + ':' + getLoggedInUserAuthToken());
      } else {
        return null;
      }
    };

    var request = function (config) {
      return $http(config);
    };

    var requestWithAbort = function (config) {
      // The $http timeout property takes a deferred value that can abort AJAX request
      var deferredAbort = $q.defer();

      config.timeout = deferredAbort.promise;

      // We keep a reference ot the http-promise. This way we can augment it with an abort method.
      var request = $http(config);

      // The $http service uses a deferred value for the timeout. Resolving the value will abort the AJAX request
      request.abort = function () {
        deferredAbort.resolve();
      };

      // Make garbage collection smoother by forcing the request.abort to an empty function
      // and then set the deferred abort and the request to null
      // This cleanup is performed once the request is finished.
      request.finally(
        function () {
          request.abort = angular.noop; // angular.noop is an empty function
          deferredAbort = request = null;
        }
      );

      return request;
    };
  }]);

