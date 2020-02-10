import Utilities from "./Utilities";

export default class RemoveCookies {

  init() {
    this.removeUnwantedCookies();
  }

  removeUnwantedCookies() {
    let cookieList = [];

    document.cookie.split(';').map(function(a){
      cookieList.push(a.split('=')[0].replace(/(^\s*)|(\s*&)/, ''));
    });

    for(let service in window.CookieConsent.config.services) {
      if (Utilities.objectType(window.CookieConsent.config.services[service].cookies) === 'Array') {
        // Remove cookies if they are not wanted by user
        if (! window.CookieConsent.config.categories[window.CookieConsent.config.services[service].category].wanted) {
          for(let i in window.CookieConsent.config.services[service].cookies) {
            let type = Utilities.objectType(window.CookieConsent.config.services[service].cookies[i]);
            if (type === 'String') {
              if (cookieList.indexOf(window.CookieConsent.config.services[service].cookies[i]) > -1) {
                this.removeCookie(window.CookieConsent.config.services[service].cookies[i]);
              }
            } else if (type === 'RegExp') {
              // Searching cookie list for cookies matching specified RegExp
              for (let c in cookieList) {
                if (cookieList[c].match(window.CookieConsent.config.services[service].cookies[i])) {
                  this.removeCookie(cookieList[c]);
                }
              }
            }
          }
        }
      }
    }
  }

  removeCookie(cookie) {
    // Removing cookies from domain and .domain
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1980 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1980 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
  }
}
