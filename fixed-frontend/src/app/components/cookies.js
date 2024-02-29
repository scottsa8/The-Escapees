/**
 * Sets a cookie with the given name and value.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 */
export function setCookie(name, value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} - The value of the cookie, or null if the cookie is not found.
 */
export function getCookie(name) {
    const nameEQ = name + "=";
    const cookieArray = document.cookie.split(';');
    for(let i=0;i < cookieArray.length;i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0)==' '){
        cookie = cookie.substring(1,cookie.length);
      }
      if (cookie.indexOf(nameEQ) == 0){
        return cookie.substring(nameEQ.length,cookie.length);
      }
    }
    return null;
}

/**
 * Fetches the update delay from the 'updateDelay' cookie and returns it in milliseconds.
 * If the cookie is not set, a default delay of 10 seconds (10000 milliseconds) is returned.
 * 
 * @returns {number} The update delay in milliseconds.
 */
export function fetchUpdateDelay () {
  const delay = getCookie('updateDelay');
  return delay ? parseInt(delay, 10) * 1000 : 10000;
}