<template>
  <div class="header">
    <button class="back"
            @click="goBack">
      <van-icon name="arrow-left"
                size=".22rem" />
    </button>
    <button class="close"
            @click="close">
      <van-icon name="cross"
                size=".22rem" />
    </button>
    <div class="title">{{$route.meta.title}}</div>
  </div>
</template>

<script type="text/ecmascript-6">
import routes from '@/router/routes'
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: "BHeader",
  data () {
    return {

    }
  },
  components: {},
  methods: {
    ...mapGetters(['getBackToName', 'getProductId']),
    ...mapMutations(['setProductId']),
    goBack () {
      let u = navigator.userAgent, app = navigator.appVersion
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 //如果输出结果是true就判定是android终端或者uc浏览器
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //根据输出结果true或者false来判断ios终端
      console.log('goback', this.getBackToName())
      if (this.getBackToName() === null ||this.getBackToName() =='index') {
        this.setProductId('') // 关闭浏览器清空productId
        if (isAndroid) {
          window.Android.backToApp()
        } else if (isiOS) {
          window.webkit.messageHandlers.closeWeb.postMessage('')
        }
        return
      }
      let id = this.getProductId()
      let name = this.getBackToName()
      this.$router.push({
        name,
        params: {
          id
        }
      })
    },
    close () {
      let u = navigator.userAgent, app = navigator.appVersion
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      this.setProductId('') // 关闭浏览器清空productId
      if (isAndroid) {
        window.Android.backToApp()
      } else if (isiOS) {
        window.webkit.messageHandlers.closeWeb.postMessage('')
      }
      // this.$router.push('/shop-index')
    },
    listeningBack () {
      window.history.pushState(null, null, document.URL)
      window.addEventListener("popstate", this.goBack, false)
    }
  },
  mounted () {
    // this.listeningBack()
    var u = navigator.userAgent, app = navigator.appVersion
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //如果输出结果是true就判定是android终端或者uc浏览器
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //根据输出结果true或者false来判断ios终端

    console.log('哈哈',$route.name)
  },
  watch: {
    $route (to, from) {
      this.listeningBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  height: 100%;
  .back {
    position: absolute;
    width: 0.22rem;
    height: 0.22rem;
    top: 0.11rem;
    left: 0.12rem;
  }
  .close {
    position: absolute;
    width: 0.22rem;
    height: 0.22rem;
    top: 0.11rem;
    left: 0.49rem;
  }
  .title {
    width: 100%;
    height: 0.22rem;
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    font-size: 0.16rem;
    font-weight: 600;
    text-align: center;
    color: rgba(0, 0, 0, 1);
  }
  .van-icon {
    display: block;
  }
}
</style>
