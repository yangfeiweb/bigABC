import Vue from 'vue'
import Router from 'vue-router'

import routerRoot from '@/components/routerRoot'
// auth
import login from '@/pages/auth/login'
import changePwd from '@/pages/auth/changePwd'
import registry from '@/pages/auth/registry'
import forgetPwd from '@/pages/auth/forgetPwd'
// import setPwd from '@/pages/auth/setPwd'

// main
import main from '@/components/main'

// home
import home from '@/pages/home/index'
import wordList from '@/pages/home/words/wordList'
import scan from '@/pages/home/scan'
// import wordDetails from '@/pages/home/words/wordDetails'
import forgetList from '@/pages/home/words/forgetList'
import gradeList from '@/pages/home/grade/gradeList'
import pressList from '@/pages/home/grade/pressList'
import unitList from '@/pages/home/grade/unitList'

// learnFlow
import learnFlow from '@/pages/learnFlow/index'
import learning from '@/pages/learnFlow/learning'

// homework
import homework from '@/pages/homework/index'

// message
import message from '@/pages/message/index'

// ranking
import ranking from '@/pages/ranking/index'
import scoreRanking from '@/pages/ranking/scoreRanking'

// shopping
import shopping from '@/pages/shopping/index'

// personal
import personal from '@/pages/personal/index'
import learnRecord from '@/pages/personal/children/learnRecord'
import signIn from '@/pages/personal/children/signIn'
import help from '@/pages/personal/children/help'
import vesion from '@/pages/personal/children/vesion'
import vip from '@/pages/personal/children/vip'
import bills from '@/pages/personal/children/bills'
import suggestion from '@/pages/personal/children/suggestion'
import payResult from '@/pages/personal/children/payResult'
import materials from '@/pages/personal/children/materials/index'
import infoEdit from '@/pages/personal/children/materials/children/infoEdit'
import infoDetail from '@/pages/personal/children/materials/children/infoDetail'
import picEdit from '@/pages/personal/children/materials/children/picEdit'
import teachers from '@/pages/personal/children/materials/children/teachers'

// test
import test from '@/components/test'
// import testScroll3 from '@/components/testScroll3'
// import linkGame from '@/pages/game/linkGame'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/auth/login'
    },
    {
      path: '/test',
      component: test
    },
    // {
    //   path: '/testScroll3',
    //   component: testScroll3
    // },
    // {
    //   path: '/linkGame',
    //   component: linkGame
    // },
    {
      path: '/auth',
      name: 'auth',
      component: routerRoot,
      children: [
        {
          path: 'login',
          name: 'login',
          meta: { requiresAuth: false, backType: 0 }, // backType 0: quit, -1: back
          component: login
        },
        {
          path: 'changePwd',
          name: 'changePwd',
          meta: { requiresAuth: false, backType: -1 },
          component: changePwd
        },
        {
          path: 'registry',
          name: 'registry',
          meta: { requiresAuth: false, backType: -1 },
          component: registry
        },
        {
          path: 'forgetPwd',
          name: 'forgetPwd',
          meta: { requiresAuth: false, backType: -1 },
          component: forgetPwd
        }
        // {
        //   path: 'setPwd/:phoneNo/:captcha/:captchaKey',
        //   name: 'setPwd',
        //   meta: { requiresAuth: false, backType: -1 },
        //   component: setPwd
        // }
      ]
    },
    {
      path: '/main',
      name: 'main',
      component: main,
      redirect: 'main/home',
      children: [
        {
          path: 'home',
          name: 'home',
          meta: { requiresAuth: true, backType: 0 },
          component: home
        },
        {
          path: 'msg',
          name: 'msg',
          meta: { requiresAuth: true, backType: 0 },
          component: message
        },
        {
          path: 'ranking',
          name: 'ranking',
          meta: { requiresAuth: true, backType: 0 },
          component: ranking
        },
        {
          path: 'shopping',
          name: 'shopping',
          meta: { requiresAuth: true, backType: 0 },
          component: shopping
        },
        {
          path: 'personal',
          name: 'personal',
          meta: { requiresAuth: true, backType: 0 },
          component: personal
        }
      ]
    },
    {
      path: '/scan',
      name: 'scan',
      meta: { requiresAuth: true, backType: -1 },
      component: scan
    },
    {
      path: '/homework',
      name: 'homework',
      meta: { requiresAuth: true, backType: -1 },
      component: homework
    },
    {
      path: '/learnFlow',
      name: 'learnFlow',
      meta: { requiresAuth: true, backType: -1 },
      component: learnFlow
    },
    {
      path: '/learning/:step/:taskNo',
      name: 'learning',
      meta: { requiresAuth: true, backType: -1 },
      component: learning
    },
    {
      path: '/pressList',
      name: 'pressList',
      meta: { requiresAuth: true, backType: -1 },
      component: pressList
    },
    {
      path: '/gradeList',
      name: 'gradeList',
      meta: { requiresAuth: true, backType: -1 },
      component: gradeList
    },
    {
      path: '/unitList',
      name: 'unitList',
      meta: { requiresAuth: true, backType: -1 },
      component: unitList
    },
    {
      path: '/words',
      name: 'words',
      component: routerRoot,
      redirect: '/words/all',
      children: [
        {
          path: 'all',
          name: 'wordList',
          meta: { requiresAuth: true, backType: -1 },
          component: wordList
        },
        // {
        //   path: 'details',
        //   name: 'wordDetails',
        //   meta: { requiresAuth: true, backType: -1 },
        //   component: wordDetails
        // },
        {
          path: 'forgetList',
          name: 'forgetList',
          meta: { requiresAuth: true, backType: -1 },
          component: forgetList
        }
      ]
    },
    {
      path: '/personInfos',
      name: 'personInfos',
      component: routerRoot,
      children: [
        {
          path: 'learnRecord',
          name: 'learnRecord',
          meta: { requiresAuth: true, backType: -1 },
          component: learnRecord
        },
        {
          path: 'signIn',
          name: 'signIn',
          meta: { requiresAuth: true, backType: -1 },
          component: signIn
        },
        {
          path: 'help',
          name: 'help',
          meta: { requiresAuth: true, backType: -1 },
          component: help
        },
        {
          path: 'vesion',
          name: 'vesion',
          meta: { requiresAuth: true, backType: -1 },
          component: vesion
        },
        {
          path: 'vip',
          name: 'vip',
          meta: { requiresAuth: true, backType: -1 },
          component: vip
        },
        {
          path: 'bills',
          name: 'bills',
          meta: { requiresAuth: true, backType: -1 },
          component: bills
        },
        {
          path: 'suggestion',
          name: 'suggestion',
          meta: { requiresAuth: true, backType: -1 },
          component: suggestion
        },
        {
          path: 'payResult/:orderNo',
          name: 'payResult',
          meta: { requiresAuth: true, backType: -1 },
          component: payResult
        },
        {
          path: 'materials',
          name: 'materials',
          meta: { requiresAuth: true, backType: -1 },
          component: materials
        },
        {
          path: 'infoDetail',
          name: 'infoDetail',
          meta: { requiresAuth: true, backType: -1 },
          component: infoDetail
        },
        {
          path: 'infoEdit',
          name: 'infoEdit',
          meta: { requiresAuth: true, backType: -1 },
          component: infoEdit
        },
        {
          path: 'picEdit',
          name: 'picEdit',
          meta: { requiresAuth: true, backType: -1 },
          component: picEdit
        },
        {
          path: 'teachers',
          name: 'teachers',
          meta: { requiresAuth: true, backType: -1 },
          component: teachers
        },
        {
          path: 'scoreRanking',
          name: 'scoreRanking',
          meta: { requiresAuth: true, backType: -1 },
          component: scoreRanking
        }
      ]
    }
  ]
})
