'use strict';

var assert = require('assert'),
  R = require('ramda');

module.exports = function userProfileFilter(user) {

  assert.equal(typeof (user), 'object', 'argument user must be an object');

  // Filters to extract values from received stored OAuth objects
  var providerFilters = {
    google: function (providers) {
      return {
        displayName: providers.google.displayName,
        url: providers.google.url,
        image: providers.google.image.url
      };
    },
    facebook: function (providers) {
      return {
        displayName: providers.facebook.name,
        url: providers.facebook.link,
        image: 'https://graph.facebook.com/' + providers.facebook.id + '/picture'
      };
    }

  };

  /**
   * providerFilters object - the filter object with methods to extract user data
   * providers object - the stored user oauth provider data (google, facebook etc)
   * filterName string - the name of the providerFilters filter to apply to the providers object
   */
  var curriedApplyProviderFilter = R.curry(function(providerFilters, providers, filterName) {
    return providerFilters[filterName](providers);
  });
  // Function that requires a filterName
  var applyProviderFilter = curriedApplyProviderFilter(providerFilters, user.providers);

  /**
   * applyProviderFilter Function - curried function that requires a filter name
   * name String - name of the filter to apply to the applyProviderFilter
   */
  var curriedApplyFilters = R.curry(function (applyProviderFilter, name) {
      var provider = Object.create({});
      provider[name] = applyProviderFilter(name);
      return provider;
    }
  );
  // Function that requires a filterName
  var applyFilters = curriedApplyFilters(applyProviderFilter);

  var filterUserProviders = R.compose(
    R.map(applyFilters),
    R.keys()
  );

  return filterUserProviders(user.providers);

};
