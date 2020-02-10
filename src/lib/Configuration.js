import Utilities from "./Utilities";
import loMerge from 'lodash/merge';

export default class Configuration {

  constructor(configObject) {

    window.CookieConsent.buffer = {
      appendChild: [],
      insertBefore: []
    }

    // Wrapper filter function
    window.CookieConsent.wrapper = function() {};

    // Settings injector for users
    window.CookieConsent.setConfiguration = this.setConfiguration.bind(this);

    window.CookieConsent.config = {
      active: true,
      cookieExists: false,
      cookieVersion: 1,
      modalMainTextMoreLink: 'https://example.com',
      barTimeout: 1000,
      theme: {
        barColor: '#2C7CBF',
        barTextColor: '#FFF',
        barMainButtonColor: '#FFF',
        barMainButtonTextColor: '#2C7CBF',
        modalMainButtonColor: '#4285F4',
        modalMainButtonTextColor: '#FFF',
      },
      language: {
        current: 'en',
        locale: {
          en: {
            barMainText: 'This website uses cookies to ensure you get the best experience on our website.',
            barLinkSetting: 'Cookie Settings',
            barBtnAcceptAll: 'Accept all cookies',
            barBtnPricacySettings: 'Privacy Settings',
            barBtnRejectAll: 'Revoke consent',
            modalMainTitle: 'Cookie settings',
            modalMainText: 'Cookies are small piece of data sent from a website and stored on the user\'s computer by the user\'s web browser while the user is browsing. Your browser stores each message in a small file, called cookie. When you request another page from the server, your browser sends the cookie back to the server. Cookies were designed to be a reliable mechanism for websites to remember information or to record the user\'s browsing activity. ',
            modalBtnSave: 'Save current settings',
            modalBtnAcceptAll: 'Accept all cookies and close',
            modalAffectedSolutions: 'Affected solutions:',
            learnMore: 'Learn More',
            on: 'On',
            off: 'Off',
          },
          de: {
            barMainText: 'Diese Webseite setzt Cookies ein.',
            barLinkSetting: 'Cookie Einstellungen',
            barBtnAcceptAll: 'Alle Cookies akzeptieren',
            barBtnRejectAll: 'Zustimmung zurückziehen',
            modalMainTitle: 'Alle Cookies akzeptieren',
            modalMainText: 'Sie können der Verwendung von Cookies, aufgeteilt in einzelne Kategorien, welche im nächsten Abschnitt erklärt werden, zustimmen oder diese ablehnen. Ihre Entscheidung können sie durch aufklappen dieses Banners jederzeit ändern.Weiter können Sie mehr über die Nutzung von Cookies und verwandter Technologien auf dieser Webseite erfahren, wenn Sie unsere Datenschutzerklärung lesen. ',
            modalBtnSave: 'Auswahl speichern',
            modalBtnAcceptAll: 'Alle Cookies akzeptieren und schliessen',
            modalAffectedSolutions: 'Betroffene Cookies:',
            learnMore: 'Mehr erfahren',
            on: 'Ein',
            off: 'Aus',
          }
        }
      },
      categories: {},
      services: {}
    }

    this.setConfiguration(configObject);

  }

  setConfiguration(configObject) {
    // The user overrides the default config
    loMerge(window.CookieConsent.config, configObject);

    // The cookie overrides the default and user config
    this.cookieToConfig();

    // We tell the world we did this
    Utilities.dispatchEvent(document, 'CCConfigSet');
  }

  cookieToConfig() {

    function removeReload() {
      Utilities.removeCookie();
      location.reload();
      return false;
    }

    document.cookie.split(';').filter((item) => {

      if (item.indexOf('cconsent')  >= 0) {
        var cookieData = JSON.parse(item.split('=')[1]);

        // We check cookie version. If older we need to renew cookie.
        if (typeof cookieData.version === 'undefined') {
          return removeReload();
        } else {
          if (cookieData.version !== window.CookieConsent.config.cookieVersion) {
            return removeReload();
          }
        }

        // We check if cookie data categories also exist in user config
        for (let key in cookieData.categories) {

          // The cookie contains category not present in user config so we invalidate cookie
          if(typeof window.CookieConsent.config.categories[key] === 'undefined') {
            return removeReload();
          }
        }

        // We check if cookie data services also exist in user config
        cookieData.services.forEach(function(service){

          // The cookie contains service not present in user config so we invalidate cookie
          if(typeof window.CookieConsent.config.services[service] === 'undefined') {
            return removeReload();
          }
        });

        // We we integrate cookie data into the global config object
        for (let key in cookieData.categories) {
          window.CookieConsent.config.categories[key].checked = window.CookieConsent.config.categories[key].wanted = (cookieData.categories[key].wanted === true) ? true : false;
        }

        window.CookieConsent.config.cookieExists = true;
        return true;
      }
    });

    return false;
  }

}
