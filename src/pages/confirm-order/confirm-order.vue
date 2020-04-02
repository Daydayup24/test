<template>
  <div class="confirm">
    <div class="confirm-order">
      <div class="contact-warp">
        <div v-if="haveAddress" @click="chooseAddress">
          <div class="contact">
            <span>{{nowAddressInfo.name}}</span>
            <i>{{nowAddressInfo.phone}}</i>
          </div>
          <div
            :class="nowAddressInfo.default==1 ? 'default-address' : 'address'"
          >{{nowAddressInfo.province}} {{nowAddressInfo.city}} {{nowAddressInfo.area}} {{nowAddressInfo.address}}</div>
        </div>
        <div class="add-address" @click="addAddress" v-else>
          <span>添加地址</span>
        </div>
        <p class="line"></p>
        <div class="icon">
          <van-icon name="arrow" color="#8F959A" />
        </div>
      </div>
      <div class="order-shop">
        <div class="item-header">
          <!-- <div class="shop-avatar"></div> -->
          <div class="shop-name">{{infor.username}}</div>
          <div class="right">
            <van-icon name="arrow" size=".14rem" />
          </div>
        </div>
        <div class="desc">
          <div class="desc-img">
            <img :src="infor.headImage" />
          </div>
          <div class="desc-info">
            <div class="text">{{infor.title}}</div>
            <div class="price">
              <span>￥</span>
              {{infor.price && infor.price.split('.')[0]}}
              <span>.{{infor.price && infor.price.split('.')[1]}}</span>
            </div>
            <div class="inventory">库存：{{infor.numberType == 1 ? '不限量' : infor.number}}</div>
          </div>
        </div>
        <div class="count">
          <span>购买数量</span>
          <div v-if="infor.numberType==1">
            <van-stepper v-model="num" integer input-width=".37rem" @change="onChange" />
          </div>
          <div v-else>
            <van-stepper
              v-model="num"
              integer
              :max="infor.number"
              input-width=".37rem"
              @change="onChange"
              :quota="infor.number"
            />
          </div>
        </div>
        <div class="method">
          <span>配送方式</span>
          <i>包邮</i>
        </div>
        <div class="clc">
          <span>共{{num}}件</span>
          <i>小计：</i>
          <em>￥{{totalPrice}}</em>
        </div>
      </div>
      <!-- 占位 -->
      <div class="footer-flag" v-show="hideShow"></div>
      <div class="order-footer" v-show="hideShow">
        <span>
          ￥<i>{{parseInt(totalPrice)}}</i>.{{totalPrice.toString().split('.')[1]}}
        </span>
        <button @click="createOrder">提交订单</button>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex';

export default {
  name: '',
  data() {
    return {
      num: 1,
      infor: '',
      productId: '',
      totalPrice: 0,
      haveAddress: true,
      nowAddressInfo: '',
      docmHeight:
        document.documentElement.clientHeight || document.body.clientHeight,
      showHeight:
        document.documentElement.clientHeight || document.body.clientHeight,
      hideShow: true, //显示或隐藏footer
    };
  },
  components: {},
  methods: {
    ...mapMutations(['setBackName']),
    ...mapGetters(['getUserId', 'getProductId']),
    addAddress() {
      this.$router.push({
        name: 'add-address',
        params: {
          act: 'buy',
          id: this.$route.params.id,
        },
      });
    },
    onChange(val) {
      this.totalPrice = (val * this.infor.price).toFixed(2);
    },
    chooseAddress() {
      this.$router.push({
        name: 'my-address',
        params: {
          act: 'chooseAddress',
          productId: this.getProductId(),
        },
      });
    },
    createOrder() {
      if (!this.haveAddress) {
        this.$toast('\n请填写收货地址\n\n');
        return;
      }
      let data = {
        userId: this.getUserId(),
        productId: this.getProductId(),
        price: this.infor.price,
        number: this.num,
        addressId: this.nowAddressInfo.id,
      };
      this.$http.createOrder(data).then(res => {
        console.log(data)
        if (res && res.code === 1) {
          // alert(JSON.stringify(res))
          let u = navigator.userAgent,
            app = navigator.appVersion;
          let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
          let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
          if (isAndroid) {
            window.Android.pay(JSON.stringify(res));
          } else if (isiOS) {
            window.webkit.messageHandlers.pay.postMessage(JSON.stringify(res));
          }
          // this.$router.push('/payment-success')
        }
      });
    },
    // 支付回调
    payCallBack(code) {
      console.log(code)
      if (code === '1') {
        this.$toast.success('支付成功');
        this.$router.push('/payment-success');
      } else {
        this.$toast.fail('支付失败');
      }
    },
    deactivePay(code){
      if(code==1){
      this.$toast('您有订单还没支付哟');
      this.$router.push('/order-list');
      }
    }
  },
  created() {
    // console.log(this.$route.params)
    if (this.$route.params.selectedAddress) {
      // 如果是选择地址返回的，不做请求
      this.haveAddress = true;
      this.nowAddressInfo = this.$route.params.selectedAddress;
    } else {
      let data = {
        userId: this.$store.state.userId,
      };
      this.$http.getAddressList(data).then(res => {
        let { data } = res;
        if (data.length === 0) {
          this.haveAddress = false;
        } else {
          this.nowAddressInfo = data[0];
        }
      });
    }
  },
  mounted() {
    window.payCallBack = this.payCallBack;
    window.deactivePay = this.deactivePay;
    this.setBackName('detail');
    this.productId = this.getProductId();
    this.$http.getShopDetail({ productId: this.productId }).then(resp => {
      let { data } = resp;
      this.infor = data;
      this.totalPrice = this.infor.price;
    });
    //监听事件
    window.onresize = () => {
      return (() => {
        this.showHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
      })();
    };
  },
  watch: {
    //监听显示高度
    showHeight: function() {
      if (this.docmHeight > this.showHeight) {
        //隐藏
        this.hideShow = false;
      } else {
        //显示
        this.hideShow = true;
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    // 如果不存在id，跳转到404
    // if (!to.params.id) {
    //   next('/404')
    // }
    next();
  },
};
</script>

<style lang="scss" scoped>
.confirm {
  height: 100%;
}
.confirm-order {
  height: 100%;
  background: #f6f7fa;
  display: flex;
  flex-direction: column;
  .contact-warp {
    height: 0.97rem;
    margin-bottom: 0.1rem;
    background: #fff;
    position: relative;
    .contact {
      padding-top: 0.1rem;
      margin-bottom: 8px;
      padding: 0 0.2rem;
      span {
        font-size: 0.16rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        margin-right: 8px;
      }
      i {
        font-size: 0.12rem;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(144, 144, 144, 1);
      }
    }
    .address,
    .default-address {
      font-size: 0.14rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 0.24rem;
      padding-left: 0.2rem;
      padding-right: 0.4rem;
    }
    .default-address::before {
      content: '默认';
      font-size: 0.1rem;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      background: #ffd200;
      padding: 0 4px;
      margin-right: 4px;
    }
    .add-address {
      height: 100%;
      display: flex;
      padding-left: 0.2rem;
      justify-content: flex-start;
      align-items: center;
      span {
        display: flex;
        align-items: center;
        font-size: 0.14rem;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
      }
      span::before {
        content: '';
        display: inline-block;
        margin-right: 0.1rem;
        width: 0.2rem;
        height: 0.2rem;
        vertical-align: middle;
        background: url(../../assets/images/add.png) no-repeat center;
        background-size: 100% 100%;
      }
    }
    .line {
      position: absolute;
      bottom: 0;
      width: 4rem;
      height: 3px;
      background: url(../../assets/images/line.png) no-repeat center;
      background-size: 100% 100%;
    }
    .icon {
      position: absolute;
      right: 0.2rem;
      top: 0;
      bottom: 0;
      margin: auto 0;
      width: 0.2rem;
      height: 0.2rem;
    }
  }
  .order-shop {
    flex: 1;
    width: 100%;
    background: #fff;
    padding: 0 0.2rem;
    .item-header {
      height: 0.4rem;
      border-bottom: 1px solid #f1f4fb;
      display: flex;
      align-items: center;
      .shop-avatar {
        width: 0.24rem;
        height: 0.24rem;
        border-radius: 5px;
        margin-right: 0.16rem;
        background: yellow;
      }
      .shop-name {
        font-size: 0.15rem;
        font-family: Helvetica, PingFangTC-Regular, PingFangTC;
        font-weight: 400;
        color: rgba(74, 74, 74, 1);
        margin-right: 2px;
      }
      .right {
        width: 0.14rem;
        height: 0.14rem;
      }
    }
    .desc {
      display: flex;
      margin-top: 0.2rem;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid rgba(241, 244, 251, 1);
      .desc-img {
        width: 1.1rem;
        height: 1.1rem;
        margin-right: 0.2rem;
        img {
          // width: 100%;
          // height: 100%;
          width: 1.1rem;
          height: 1.1rem;
        }
      }
      .desc-info {
        .text {
          width: 2.05rem;
          height: 0.42rem;
          margin-top: 0.04rem;
          margin-bottom: 0.23rem;
          font-size: 0.15rem;
          font-weight: 400;
          color: rgba(0, 0, 0, 1);
          line-height: 0.21rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .price {
          font-size: 0.18rem;
          font-family: Helvetica-Bold, Helvetica;
          font-weight: bold;
          color: rgba(250, 100, 0, 1);
          span {
            font-size: 0.12rem;
          }
        }
        .inventory {
          margin-top: 0.02rem;
          font-size: 0.12rem;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
        }
      }
    }
    .count,
    .method {
      margin-top: 0.1rem;
      height: 0.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(144, 144, 144, 1);
      }
      i {
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
      }
    }
    .clc {
      margin-top: 0.1rem;
      height: 0.4rem;
      display: flex;
      justify-content: flex-end;
      span {
        font-size: 0.12rem;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909090;
        margin-right: 0.1rem;
      }
      i {
        font-size: 0.12rem;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
      }
      em {
        color: #fb6f00;
      }
    }
  }
}
.footer-flag {
  height: 0.5rem;
}
.order-footer {
  position: fixed;
  width: 100%;
  height: 0.5rem;
  bottom: 0;
  padding: 0 0.2rem;
  border-top: 1px solid #eaeef6;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 0.12rem;
    font-family: Helvetica;
    color: rgba(250, 100, 0, 1);
    i {
      font-size: 0.24rem;
    }
  }
  button {
    width: 1.45rem;
    height: 0.4rem;
    background: rgba(250, 100, 0, 1);
    border-radius: 0.2rem;
    line-height: 0.4rem;
    text-align: center;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #fff;
  }
}
</style>
