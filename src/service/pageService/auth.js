import reqUrl from '../urlConfig'
import fetch from '@/utility/http'

let login = (phoneNo, pwd, deviceId, isTourist = false, captcha, captchaKey) =>
  fetch(
    reqUrl.LOGIN,
    {
      phoneNo: phoneNo,
      password: pwd,
      deviceId: deviceId,
      captcha: captcha || '',
      captchaKey: captchaKey || '',
      tourist: isTourist ? 'Y' : 'N'
    },
    'POST'
  )
let changePassword = (oldPassword, newPassword) =>
  fetch(
    reqUrl.POST_CHANGEPASSWORD_DATA,
    {
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    'POST'
  )

let register = (phoneNo, password, captcha, captchaKey) =>
  fetch(
    reqUrl.REGISTER,
    {
      phoneNo: phoneNo,
      password: password,
      captcha: captcha,
      captchaKey: captchaKey
    },
    'POST'
  )

let getCaptcha = (phoneNo, type) =>
  fetch(
    reqUrl.GET_CAPTCHA,
    {
      captchaType: type,
      phoneNo: phoneNo
    },
    'POST'
  )

let getForgotPass = (phoneNo, password, captcha, captchaKey) =>
  fetch(
    reqUrl.GET_FORGET,
    {
      phoneNo: phoneNo,
      password: password,
      captcha: captcha,
      captchaKey: captchaKey
    },
    'POST'
  )

// 退出登录
let logout = () => fetch(reqUrl.LOGOUT, {}, 'POST')

// 检测手机是否需要发送验证码
let checkPhoneNo = phoneNo => fetch(reqUrl.CHECK_PHONENO, { phoneNo: phoneNo })
export default {
  login,
  logout,
  changePassword,
  register,
  getCaptcha,
  getForgotPass,
  checkPhoneNo
}
