export const openNewView =(data)=>{
      // let baseURL= 'http://mall.gchating.com';
      // let baseURL= 'http://192.168.0.13:8090';
      let baseURL ='http://192.168.0.60:8080'

      let url =baseURL.concat(data)
          // console.log(url)
          // return
           let u = navigator.userAgent,
            app = navigator.appVersion;
          let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
          let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
          if (isAndroid) {
            window.Android.openNewView(url);
          } else if (isiOS) {
            window.webkit.messageHandlers.openNewView.postMessage(url);
            // window.webkit.messageHandlers.openNewView(data);
          }
}