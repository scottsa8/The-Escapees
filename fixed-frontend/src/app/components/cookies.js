export function setCookie(name, value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}

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