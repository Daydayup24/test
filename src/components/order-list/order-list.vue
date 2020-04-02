<template>
  <div class="list">
    <div class="list-item"
         v-for="(item, i) in orderList"
         :key="item.id">
      <div class="item-header">
        <!-- <div class="shop-avatar"></div> -->
        <div class="shop-name">{{item.username}}</div>
        <div class="right">
          <van-icon name="arrow"
                    size=".14rem" />
        </div>
        <!-- // 0 待支付 1-已支付（代发货） -1 退款申请中 -2 退款中 -3 退款交易完成 2 已发货 3 交易成功 99 全部订单 -->
        <div class="status"
             v-if="item.agree==2" style="fontWeight: normal !important"><em>退货申请失败</em>
              <em v-if="item.status==1">(待发货)</em>
              <em v-else-if="item.status==2" style="display:flex;alignItems:center">(配送中)</em>
              <em v-else-if="item.status==3" style="display:flex;alignItems:center"><em>(交易完成)</em><i @click="delOrder(item.id)"></i></em>
              <em v-else-if="item.status==-1" style="display:flex;alignItems:center">(退款申请中)</em>
              <em v-else-if="item.status==-2" style="display:flex;alignItems:center">(退款中)</em>
              <em v-else-if="item.status==-3" style="display:flex;alignItems:center"><em>(退款完成)</em><i @click="delOrder(item.id)"></i></em>
             </div>
        <div class="status status-loading status-del"
             v-else-if="item.status == 0 && !isOverdue(item.createTime)">待支付<span @click="delOrder(item.id)"></span></div>
        <div class="status status-overdue status-del"
             v-else-if="item.status == 0 && isOverdue(item.createTime)">已过期<span @click="delOrder(item.id)"></span></div>
        <div class="status status-loading"
             v-else-if="item.status==1">待发货</div>
        <div class="status status-going"
             v-else-if="item.status==2">配送中</div>
        <div class="status status-del"
             v-else-if="item.status==3">交易完成<span @click="delOrder(item.id)"></span></div>
        <div class="status status-going"
             v-else-if="item.status==-1">退款申请中</div>
        <div class="status status-going"
             v-else-if="item.status==-2">退款中</div>
        <div class="status status-del"
             v-else-if="item.status==-3">退款完成<span @click="delOrder(item.id)"></span></div>
      </div>
      <div class="desc"
           @click="goOrderDetail(item)">
        <div class="desc-img">
          <img :src="item.productImage" />
        </div>
        <div class="desc-info">
          <div class="text">{{item.productTitle}}</div>
          <div class="price">
            <span>￥</span>{{item.payPrice | getParseInt}}<span>.{{item.payPrice | getFloat}}</span>
          </div>
          <div class="inventory">数量：{{item.number}}</div>
          <div class="createTime">下单时间：{{item.createTime | formatDate}}</div>

          <!-- 物流信息 -->
          <div class="logistics-msg" v-if="item.status==2">物流名称：{{item.logisticsType}}</div>
          <div class="logistics-msg" v-if="item.status==2">物 流 号：{{item.logistics}}</div>
        </div>
      </div>
      <div class="edit-btn"
           @click="editOrderId=item.id"
           v-if="item.status==1 || item.status==2 || item.status==0&& !isOverdue(item.createTime) || item.status==-2">
        <div class="refund"
             v-if="item.status==1"
             @click="show1=true">我要退款</div>
        <div class="refund"
             v-else-if="item.status==2">
          <button @click="show1=true">我要退款</button>
          <span>|</span>
          <button @click="show=true">确认收货</button>
        </div>
        <div class="refund"
             v-else-if="item.status==0 && !isOverdue(item.createTime)">
          <button @click="createPay(item)">立即支付</button>
        </div>
        <div class="refund"
             v-else-if="item.status==-2">
          <button @click="show2=true">确认退款</button>
        </div>
        <div class="refund"
             v-else></div>
      </div>
      <p class="margin-line" v-show="i != orderList.length-1"></p>
    </div>
    <!-- 弹框 -->
    <div class="dialog-confirm"
         v-show="show">
      <div class="t-title">
        <button class="close"
                @click="show = false">
          <van-icon name="cross"
                    size=".14rem" />
        </button>
        <span>确认收货</span>
      </div>
      <div class="content">
        <p>成功收到商品，并确认收货！</p>
        <p>一旦确认不可再退货！</p>
      </div>
      <div class="ok-btn"
           @click="ensureTrade">确 认</div>
    </div>
    <van-overlay :show="show"
                 :z-index="10" />
    <!-- 弹框 -->
    <div class="dialog-refund"
         v-show="show1">
      <div class="t-title">
        <button class="close"
                @click="show1 = false">
          <van-icon name="cross"
                    size=".14rem" />
        </button>
        <span>退款申请</span>
      </div>
      <div class="content">
        <div class="select1">
          <h3 :class="isSelectedFirst ? 'select' : 'no-select'"
              @click="isSelectedFirst=true">我要退款（无需退货）</h3>
          <p>没收到货，或与卖家协商同意不用退货只退款</p>
        </div>
        <div class="select2">
          <h3 :class="isSelectedFirst ? 'no-select' : 'select'"
              @click="isSelectedFirst=false">我要退货退款</h3>
          <p>已收到货，需要退还收到的货物</p>
        </div>
      </div>
      <div class="ok-btn"
           @click="returnTrade">确 认</div>
    </div>
    <van-overlay :show="show1"
                 :z-index="10" />
                 
    <!-- 弹框 -->
    <div class="dialog-confirm"
         v-show="show2">
      <div class="t-title">
        <button class="close"
                @click="show2 = false">
          <van-icon name="cross"
                    size=".14rem" />
        </button>
        <span>确认退款</span>
      </div>
      <div class="content">
        <p>成功收到退款，并确认退款！</p>
      </div>
      <div class="ok-btn"
           @click="ensureRefund">确 认</div>
    </div>
    <van-overlay :show="show2"
                 :z-index="10" />
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations } from 'vuex';

export default {
  name: "orderList",
  props: {
    orderList: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      show: false, // 确认收货弹框
      show1: false, // 退款申请弹框
      show2: false, // 确认退款弹窗
      editOrderId: '', //正在操作的订单id
      isSelectedFirst: true
    }
  },
  components: {},
  methods: {
    ...mapMutations(['setProductId']),
    isOverdue (val) { // 超过10分钟未支付，订单过期
      return new Date().valueOf() - val * 1000 >= 10 * 60 * 1000 ? true : false
    },
    orderListRemoveOverdue (list) { // 在待支付分类中移除过期订单
      let l = list.concat()
      return l.filter(item => {
        return new Date().valueOf() - item.createTime * 1000 < 10 * 60 * 1000
      })
    },
    delOrder (orderId) {
      this.$emit('delOrder', orderId)
    },
    ensureTrade () {
      this.$emit('ensureTrade', this.editOrderId)
    },
    returnTrade () {
      this.$emit('returnTrade', { orderId: this.editOrderId, isSelectedFirst: this.isSelectedFirst })
      this.show1=false;
    },
    ensureRefund () {
      this.$emit('ensureRefund', this.editOrderId)
    },
    goOrderDetail (item) {
      if (!item.status || item.status == 0) return
      this.$router.push({
        name: 'order-detail',
        params: {
          orderId: item.id,
          payNumber: item.payNumber
        }
      })
    },
    createPay(item){
      let data = {data:{
          userId: item.userId,
          orderNumber: item.orderNumber,
          money: item.number*item.payPrice,
          merUserId:item.merUserId
      }
          
      };
      console.log(JSON.stringify(data))
     let u = navigator.userAgent,
            app = navigator.appVersion;
          let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
          let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
          if (isAndroid) {
            window.Android.pay(JSON.stringify(data));
          } else if (isiOS) {
            window.webkit.messageHandlers.pay.postMessage(JSON.stringify(data));
          }
          // this.$router.push('/payment-success')
    },
       // 支付回调
    payCallBack(code) {
      if (code === '1') {
        this.$toast.success('支付成功');
        this.$router.push('/payment-success');
      } else {
        this.$toast.fail('支付失败');
        return;
      }
    },
  },
  mounted(){
    window.payCallBack = this.payCallBack;
  }

}
</script>

<style lang="scss" scoped>
.list {
  height: 100%;
  .list-item {
    width: 100%;
    // height: 2.32rem;
    // padding: 0 0.2rem;
    display: flex;
    flex-direction: column;
    // margin-bottom: 0.1rem;
    background: #fff;
    .item-header {
      height: 0.4rem;
      border-bottom: 1px solid #f1f4fb;
      display: flex;
      align-items: center;
      padding: 0 0.2rem;
      position: relative;
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
      .status {
        position: absolute;
        height: 100%;
        top: 0;
        bottom: 0;
        right: 0.2rem;
        margin: auto 0;
        font-size: 0.15rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        span,i {
          display: inline-block;
          width: 0.26rem;
          height: 0.26rem;
          background: url(../../assets/images/delete.png) no-repeat center;
          background-size: 100% 100%;
          margin-left: 4px;
        }
      }
      .status-loading {
        color: rgba(252, 96, 96, 1);
      }
      .status-going {
        color: #ff976a;
      }
      .status-del {
        color: #6dd400;
      }
      .status-overdue {
        color: #aaa;
      }
    }
    .desc {
      display: flex;
      justify-content: space-between;
      margin-top: 0.2rem;
      padding: 0 0.2rem;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid rgba(241, 244, 251, 1);
      .desc-img {
        min-width: 1.1rem;
        min-height: 1.1rem;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .desc-info {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 0 0.2rem;
        .text {
          width: 2.05rem;
          height: 0.42rem;
          margin-top: 0.04rem;
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
        .inventory,
        .createTime {
          font-size: 0.12rem;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
        }
        .logistics-msg{
          font-size: 0.12rem;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(144, 144, 144, 1);
        }
      }
    }
    .edit-btn {
      width: 100%;
      height: 0.4rem;
      .refund {
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: 0.4rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 1);
        button {
          width: 47%;
          line-height: 0.4rem;
          text-align: center;
          font-weight: 600;
        }
        button:nth-child(3) {
          color: #f7b500;
        }
        span {
          font-size: 12px;
          font-weight: 100;
        }
      }
    }
    .margin-line {
      height: 0.1rem;
      background: #f7f8fb;
    }
  }
  .list-item:nth-last-child(1) {
    margin-bottom: 0;
  }
}
.dialog-confirm {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  padding: 0 0.18rem;
  width: 3.15rem;
  height: 2.55rem;
  background: #fff;
  border-radius: 0.15rem;
  .t-title {
    height: 0.48rem;
    text-align: center;
    line-height: 0.48rem;
    position: relative;
    button {
      position: absolute;
      left: 0;
      top: 0.18rem;
      height: 0.14rem;
      .van-icon {
        display: block;
      }
    }
    span {
      font-size: 0.16rem;
      font-weight: 600;
      color: rgba(0, 0, 0, 1);
    }
  }
  .content {
    width: 2.59rem;
    height: 0.37rem;
    position: absolute;
    left: 0.28rem;
    top: 0.85rem;
    line-height: 0.23rem;
    p {
      height: 100%;
      font-weight: 400;
      color: rgba(144, 144, 144, 1);
      text-align: center;
    }
  }
  .ok-btn {
    position: absolute;
    top: 1.58rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 2.55rem;
    height: 0.6rem;
    text-align: center;
    background: rgba(0, 0, 0, 1);
    border-radius: 0.3rem;
    border: 4px solid rgba(255, 210, 0, 1);
    line-height: 0.56rem;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 210, 0, 1);
  }
}
.dialog-refund {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  padding: 0 0.18rem;
  width: 3.15rem;
  height: 3.3rem;
  background: #fff;
  border-radius: 0.15rem;
  .t-title {
    height: 0.48rem;
    text-align: center;
    line-height: 0.48rem;
    position: relative;
    button {
      position: absolute;
      left: 0;
      top: 0.18rem;
      height: 0.14rem;
      .van-icon {
        display: block;
      }
    }
    span {
      font-size: 0.16rem;
      font-weight: 600;
      color: rgba(0, 0, 0, 1);
    }
  }
  .content {
    width: 2.75rem;
    height: 1.64rem;
    position: absolute;
    left: 0.2rem;
    top: 0.48rem;
    padding-top: 0.27rem;
    .select1 {
      margin-bottom: 0.3rem;
    }
    h3 {
      font-size: 0.15rem;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      height: 0.21rem;
    }
    h3.select::before {
      content: "";
      display: inline-block;
      vertical-align: middle;
      width: 0.18rem;
      height: 0.18rem;
      border-radius: 50%;
      background: url(../../assets/images/yixuanze.png) no-repeat center;
      background-size: 100% 100%;
      margin-right: 0.1rem;
    }
    h3.no-select::before {
      content: "";
      display: inline-block;
      vertical-align: middle;
      width: 0.18rem;
      height: 0.18rem;
      border-radius: 50%;
      background: url(../../assets/images/weixuanze.png) no-repeat center;
      background-size: 100% 100%;
      margin-right: 0.1rem;
    }
    p {
      margin-top: 2px;
      margin-left: 0.28rem;
      font-size: 0.12rem;
      font-family: PingFangSC-Regular, PingFang SC;
      color: rgba(144, 144, 144, 1);
      height: 0.17rem;
      line-height: 0.17rem;
    }
  }
  .ok-btn {
    position: absolute;
    bottom: 0.35rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 2.55rem;
    height: 0.6rem;
    text-align: center;
    background: rgba(0, 0, 0, 1);
    border-radius: 0.3rem;
    border: 4px solid rgba(255, 210, 0, 1);
    line-height: 0.56rem;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 210, 0, 1);
  }
}
</style>
