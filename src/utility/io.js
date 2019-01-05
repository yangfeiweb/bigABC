import { resourcePath } from '@/service/urlConfig'
export function downloadResource (fileName) {
  console.log('-----download img...' + fileName)
  return new Promise((resolve, reject) => {
    let nativePath = '_downloads' + fileName
    console.log('....check navtive path ' + nativePath)
    window.plus.io.resolveLocalFileSystemURL(
      nativePath,
      function (entry) {
        console.log('资源存在,直接设置=' + nativePath)
        console.log(
          '资源存在,直接设置 path==== ' +
            window.plus.io.convertLocalFileSystemURL(nativePath)
        )
        resolve(window.plus.io.convertLocalFileSystemURL(nativePath))
      },
      function (e) {
        console.log('资源不存在,联网下载=' + nativePath)
        // 如果文件不存在,联网下载资源
        let loadUrl = resourcePath + fileName

        var downloadTask = window.plus.downloader.createDownload(
          loadUrl,
          {
            filename: nativePath,
            timeout: 2,
            retryInterval: 1,
            retry: 1
          },
          function (d, status) {
            if (status === 200) {
              // 下载成功
              console.log('下载成功=' + d.filename)
              console.log(
                '下载成功= path==== ' +
                  window.plus.io.convertLocalFileSystemURL(d.filename)
              )
              resolve(window.plus.io.convertLocalFileSystemURL(d.filename))
              // setImgFromLocal(imgId, d.filename);
            } else {
              // 下载失败,需删除本地临时文件,否则下次进来时会检查到资源已存在
              console.log('下载失败=' + status + '==' + nativePath)
              reject(loadUrl)
              // downloadTask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
              // if (nativePath != null) {
              //   delFile(nativePath)
              // }
            }
          }
        )
        // 启动下载任务
        downloadTask.start()
        // cacheFile(netUrl, nativePath).then(
        //   success => {
        //     console.log('-----下载成功...' + success)
        //     console.log(resolve)
        //     console.log('---------resolve end')
        //     resolve(success)
        //   },
        //   err => {
        //     console.log('--------下载失败...' + err)
        //     reject(err)
        //   }
        // )
      }
    )
  })
}

export function clearCache (rootPath) {
  console.log('-----clear cache...')
  return new Promise((resolve, reject) => {
    // let rootPath = '_downloads/'
    window.plus.io.resolveLocalFileSystemURL(rootPath, function (entry) {
      entry.removeRecursively(
        function (entry) {
          console.log('-----clear cache...success')
          resolve()
        },
        function (e) {
          console.log('-----clear cache...error')
          reject(e)
        }
      )
    })
  })
}

export function installPkg (file) {
  return new Promise((resolve, reject) => {
    window.plus.nativeUI.showWaiting('新版本安装中...')
    window.plus.runtime.install(
      file,
      {},
      function () {
        window.plus.nativeUI.closeWaiting()
        window.plus.runtime.restart()
      },
      function (e) {
        window.plus.nativeUI.closeWaiting()
        console.log('安装新版本失败[' + e.code + ']：' + e.message)
        window.plus.nativeUI.alert('安装新版本失败[' + e.code + ']：' + e.message)
      }
    )
  })
}

/* 联网下载资源,并设置给<img> */
function cacheFile (loadUrl, nativePath) {
  // 创建下载任务
  return new Promise((resolve, reject) => {
    var downloadTask = window.plus.downloader.createDownload(
      loadUrl,
      {
        filename: nativePath
      },
      function (d, status) {
        if (status === 200) {
          // 下载成功
          console.log('下载成功=' + d.filename)
          console.log(
            '下载成功= path==== ' +
              window.plus.io.convertLocalFileSystemURL(d.filename)
          )
          resolve(window.plus.io.convertLocalFileSystemURL(d.filename))
          // setImgFromLocal(imgId, d.filename);
        } else {
          // 下载失败,需删除本地临时文件,否则下次进来时会检查到资源已存在
          console.log('下载失败=' + status + '==' + nativePath)
          // downloadTask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
          if (nativePath != null) delFile(nativePath)
          reject(loadUrl)
        }
      }
    )
    // 启动下载任务
    downloadTask.start()
  })
}

/* 删除指定文件 */
function delFile (nativePath) {
  return new Promise((resolve, reject) => {
    window.plus.io.resolveLocalFileSystemURL(nativePath, function (entry) {
      entry.remove(
        function (entry) {
          console.log('文件删除成功==' + nativePath)
          resolve()
        },
        function (e) {
          console.log('文件删除失败=' + nativePath)
          reject(e)
        }
      )
    })
  })
}
