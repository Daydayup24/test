<template>
  <div class="detail">
    <div class="detail-main">
      <!-- 图片预览 -->
      <van-image-preview v-model="show"
                         :images="swiperList"
                         @change="onChange"
                         :startPosition="startPosition">
      </van-image-preview>
      <!-- 轮播 -->
      <van-swipe indicator-color="white"
                 style="height: 3.75rem;">
        <van-swipe-item v-for="(item, i) in swiperList"
                        :key="i"
                        @click="previewImage(i)">
          <img :src="item"
               class="swiper-img" />
        </van-swipe-item>
      </van-swipe>
      <div class="info">
        <div class="info-top">
          <div class="price">￥<span>{{information.price && information.price.split('.')[0]}}</span>.{{information.price && information.price.split('.')[1]}}</div>
          <div class="inventory">库存：{{information.numberType == 1 ? '不限量' : (information.number<1 ? '缺货' : information.number)}}</div>
        </div>
        <div class="info-title">{{information.title}}</div>

        <div class="describe-box" v-if="information.describe">
          <p>{{information.describe}}</p>
        </div>
        <div class="explain">
          <p>请相信一分钱一分货的道理</p>
          <p>我们能做到的是坚持好品质<br />
            用好品质来让亲们切身体验到我们是真的实惠</p>
          <p>定制宝贝每个阶段发货时间不一样，具体咨询客服！</p>
          <p>关于退换货：签收48小时内退换</p>
          <p>喜欢退换拖延、中差评威胁、吹毛求疵者将被限制购买！</p>
          <p>尊重是相互的，美更体现在言行，感谢支持！</p>
        </div>
      </div>
    </div>
    <div class="d-footer" v-if="ready">

      <!-- <div class="btn-mer"
           v-if="$store.state.user.merId"> -->
      <div class="check"
           v-if="status!=1">
        <span class="checking">商品审核中</span>
      </div>
      <div class="btn-mer"
           v-else-if="isMer && status==1">
        <button class="btn-edit"
                @click="editShop">编辑商品</button>
        <button class="btn-share"
                @click="share">分享商品</button>
      </div>
      <button class="btn-buy"
              v-else-if="!isMer && status==1"
              @click="buy">立即购买</button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: "",
  data () {
    return {
      swiperList: [],
      show: false,
      startPosition: 0,
      information: '',
      id: '',
      backName: '',
      isMer: false,
      status: 0,
      ready: false
    }
  },
  components: {},
  methods: {
    ...mapMutations(['setProductId', 'setBackName', 'setMerId']),
    ...mapGetters(['getProductId', 'getMerId', 'getUserId']),
    share () {
      // alert(this.information)
      // console.log(this.information)
      let u = navigator.userAgent, app = navigator.appVersion
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      if (isAndroid) {
        window.Android.share(JSON.stringify(this.information))
      } else if (isiOS) {
        window.webkit.messageHandlers.share.postMessage(JSON.stringify(this.information))
      }
    },
    previewImage (index) {
      this.startPosition = index
      this.show = true
    },
    onChange (index) {
      this.index = index
    },
    editShop () {
      this.$router.push({
        name: 'shop-upload',
        params: {
          id: this.getProductId()
        }
      })
    },
    buy () {
      if (this.information.numberType != 1 && this.information.number < 1) {
        this.$toast.fail('该商品暂时缺货')
        return
      }
      this.$router.push({
        name: 'confirm-order',
        params: {
          id: this.getProductId()
        }
      })
    },
    init (newVal, oldVa) {
      this.setProductId(newVal.params.id)
      this.getDetail()
    },
    getDetail () {
      let data = {
        userId: this.getUserId(),
        productId: this.$route.params.id
      }
     
      this.$http.getShopDetail(data).then(resp => {
        let { data } = resp
        data.shareUrl = `${location.origin}/mall/detail/${data.id}`
        console.log(data.merId, this.getMerId())
        if (data.merId == this.getMerId()) { //判断是否是该商品商户
          this.isMer = true
        }
        this.information = data
        if(this.information.numberType==1){
          this.information.number=-1
        }
        this.swiperList = data.image
        this.status = data.status
        this.ready = true
      })
    }
  },
  mounted () {
    this.id = this.$route.params.id
    let timer = null
    timer = setInterval(() => {
      if (this.getUserId()) {
        let data = {
          userId: this.getUserId(),
        };
        this.$http.checkMer(data).then(resp => {
          if(resp && resp.code == 1) {
            this.setMerId(resp.data.merId)
          }
          this.getDetail();
        })
        clearInterval(timer)
      }
    }, 200)
    this.setProductId(this.id)
    this.$nextTick(() => {
      if (this.backName == 'shop-management' || this.backName == 'history' || this.backName == 'index') {
        this.setBackName(this.backName)
      } else {
        this.setBackName(null)
      }
    })
  },
  watch: {
    $route: "init"
  },
  beforeRouteLeave (to, from, next) {
    if (to.name !== 'confirm-order') {
      this.setProductId('')
    }
    next()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
    console.log(from.name)
      if (from.name == 'shop-management' || from.name == 'history' || from.name == 'index') {
        vm.backName = from.name
      }
      return
    })
  }
}
</script>

<style lang="scss" scoped>
.swiper-img {
  width: 100%;
  height: 100%;
}

.detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .detail-main {
    flex: 1;
    overflow-x: hidden;
    overflow-y: scroll;
    .info {
      padding: 0 0.2rem;
      .info-top {
        height: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .price {
          font-size: 0.12rem;
          font-family: Helvetica-Bold, Helvetica;
          font-weight: bold;
          color: rgba(250, 100, 0, 1);
          span {
            font-size: 0.18rem;
          }
        }
        .inventory {
          font-size: 0.12rem;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
        }
      }
      .info-title {
        height: 0.44rem;
        font-size: 0.16rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: rgba(0, 0, 0, 1);
        line-height: 0.22rem;
        margin-bottom: 0.15rem;
      }
      .describe-box{
        border-top: 1px dashed #ccc;
        border-bottom: 1px dashed #ccc;
        padding:  0.1rem 0;
         margin-bottom: 0.24rem;
        p{
          font-size: 0.14rem;
          // line-height: 0.24rem;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
          word-wrap:break-word;
          // margin-bottom: 0.24rem;
        }
      }
      .explain {
        p {
          font-size: 0.14rem;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
          margin-bottom: 0.24rem;
        }
      }
    }
  }
  .d-footer {
    height: 0.5rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    .btn-buy {
      width: 2.87rem;
      height: 0.4rem;
      background: rgba(255, 210, 0, 1);
      border-radius: 0.2rem;
      font-weight: 600;
      color: rgba(0, 0, 0, 1);
      text-align: center;
      line-height: 0.4rem;
      cursor: pointer;
    }
    .btn-mer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      padding: 0 0.28rem;
      align-items: center;
      button {
        width: 1.45rem;
        height: 0.4rem;
        border-radius: 0.2rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 1);
      }
      .btn-edit {
        background: rgba(255, 255, 255, 1);
        border: 1px solid rgba(151, 151, 151, 1);
      }
      .btn-share {
        background: rgba(255, 210, 0, 1);
      }
    }
    .check {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 0.28rem;
      .checking {
        font-weight: 600;
        color: rgba(0, 0, 0, 1);
      }
      .checking::before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 0.12rem;
        height: 0.12rem;
        margin-right: 0.04rem;
        background: url(../../assets/images/fahuo.png) no-repeat center;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
