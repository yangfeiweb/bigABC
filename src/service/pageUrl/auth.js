export default function (apiRoot) {
  return {
    LOGIN: apiRoot + 'login',
    POST_CHANGEPASSWORD_DATA: apiRoot + 'changePassword',
    REGISTER: apiRoot + 'register',
    GET_CAPTCHA: apiRoot + 'captcha/send',
    GET_FORGET: apiRoot + 'forgot',
    CHECK_PHONENO: apiRoot + 'checkPhoneNo'
  }
}
