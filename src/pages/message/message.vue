<template>
  <div class="message">
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh" class="list-warp">
    <!-- // 0 待支付 1-已支付（代发货） -1 退款申请中 -2 退款中 -3 退款交易完成 2 已发货 3 交易成功 99 全部订单 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoading"
      :immediate-check="false"
    >
      <div
        :class="i==msgList.length-1 ? 'msg-item msg-item-nomargin' : 'msg-item'"
        v-for="(item, i) in msgList"
        :key="item.id"
      >
        <div class="item-header">
          <p class="fahuo" v-if="item.status==1">
            <span>你有订单需发货</span>
          </p>
          <p class="tuihuo" v-else-if="item.status==-1">
            <span>有买家找你退货</span>
          </p>
          <p class="normal" v-else>
            <span>订单</span>
          </p>
          <div class="status" v-if="item.agree==2">已拒绝
            <em v-if="item.status==1 || item.status==-1">待处理</em>
            <em v-else-if="item.status==2">配送中</em>
            <em v-else-if="item.status==3">交易成功</em>
          </div>
          <div class="status" v-else-if="item.status==1 || item.status==-1">
            <span>待处理</span>
          </div>
          <div class="status" v-else-if="item.status==2">
            <i>配送中</i>
          </div>
          <div class="status" v-else-if="item.status==-2">
            <i>退货中</i>
          </div>
          <div class="status" v-else-if="item.status==3">交易成功</div>
          <div class="status" v-else-if="item.status==-3">退货完成</div>
        </div>
        <div class="desc" @click="goOrderDetail(item)">
          <div class="desc-img">
            <img :src="item.productImage" />
          </div>
          <div class="desc-info">
            <div class="text">{{item.productTitle}}</div>
            <div class="price">
              <span>￥{{item.payPrice}}</span>
              <i>数量：{{item.number}}</i>
            </div>
            <div class="address">
              <div class="name">
                <span>{{item.name}}</span>
                <i>{{item.phone}}</i>
              </div>
              <div
                class="addressDesc"
              >{{item.province}} {{item.city}} {{item.area}} {{item.address}}</div>
            </div>
            
            <div class="logistics-msg" v-if="item.status==2">
              <p>物流类型：{{item.logisticsType}}</p>
              <p>物 流 号：{{item.logistics}}</p>
            </div>
          </div>
        </div>
        <div class="edit-btn" @click="getEditInfo(item)" v-if="item.status==1 || item.status==-1 || item.status==-3 || item.status==3">
          <!-- <div class="refund" v-if="item.agree==2"></div> -->
          <div class="refund" v-if="item.status==1" @click="show2=true">确认发货</div>
          <div class="refund" v-else-if="item.status==-1">
            <div>
              <span @click="show=true">同意退货</span>
              <i>|</i>
              <span @click="disagreeShow=true">拒绝退货</span>
            </div>
          </div>
          <div class="refund" v-else-if="item.status==-2" @click="show1=true"></div>
          <div
            class="refund"
            v-else-if="item.status==-3 || item.status==3"
            @click="delOrder(item.id)"
          >删除订单</div>
        </div>
      </div>
    </van-list>
    </van-pull-refresh>
    <!-- 同意退货弹框 -->
    <div class="dialog-confirm" v-show="show">
      <div class="t-title">
        <button class="close" @click="show = false">
          <van-icon name="cross" size=".14rem" />
        </button>
        <span>确认退货</span>
      </div>
      <div class="content">
        <p>同意会员退货申请？</p>
      </div>
      <div class="ok-btn" @click="MerAgreeRefund">确 认</div>
    </div>
    <van-overlay :show="show" :z-index="10" />
    <!-- 拒绝退货弹框 -->
    <div class="dialog-confirm" v-show="disagreeShow">
      <div class="t-title">
        <button class="close" @click="disagreeShow = false">
          <van-icon name="cross" size=".14rem" />
        </button>
        <span>确认拒绝</span>
      </div>
      <div class="content">
        <p>拒绝会员退货申请？</p>
      </div>
      <div class="ok-btn" @click="disagreeRefund">确 认</div>
    </div>
    <van-overlay :show="disagreeShow" :z-index="10" />
    <!-- 完成退货弹框 -->
    <!-- <div class="dialog-confirm" v-show="show1">
      <div class="t-title">
        <button class="close" @click="show1 = false">
          <van-icon name="cross" size=".14rem" />
        </button>
        <span>完成退货</span>
      </div>
      <div class="content">
        <p>确认完成退款交易？</p>
      </div>
      <div class="ok-btn" @click="ensureRefundCompleted">确 认</div>
    </div>
    <van-overlay :show="show1" :z-index="10" /> -->
    <!-- 确认弹框 -->
    <div class="dialog-confirm" v-show="show2">
      <div class="t-title">
        <button class="close" @click="show2 = false">
          <van-icon name="cross" size=".14rem" />
        </button>
        <span>确认发货</span>
      </div>
      <div class="content">
        <p class="logistics">物流类型：<input v-model="logisticsType" type="text"/></p>
        <p class="logistics">物 流 号：<input v-model="logistics" type="text"/></p>
        <!-- <p>确认已发货？</p> -->
      </div>
      <div class="ok-btn" @click="ensureOrderSend">确 认</div>
    </div>
    <van-overlay :show="show2" :z-index="10" />
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: '',
  data() {
    return {
      isLoading: false,
      show: false,
      disagreeShow: false,
      show1: false,
      show2: false,
      msgList: [],
      page: 1,
      total: 10,
      loading: false,
      finished: false,
      editOrderId: '',
      editUserId: '',
      editPayNumber: '',
      logisticsType:'',//物流类型
      logistics:''//物流号
    };
  },
  components: {},
  methods: {
    ...mapGetters(['getMerId', 'getUserId']),
    ...mapMutations(['setBackName']),
    // init() {
    //   let data = { merId: this.getMerId() };
    //   // this.page = 0;
    //   // this.total = 10;
    //   this.getMsgList(data);
    // },
    goOrderDetail(item) {
      // this.$router.push({
      //   name: 'order-detail',
      //   params: {
      //     orderId: item.id,
      //     payNumber: item.payNumber,
      //     pos: 'message'
      //   }
      // })
    },
    // 获取正在操作的那条消息的数据
    getEditInfo(item) {
      this.editOrderId = item.id;
      this.editUserId = item.userId;
      this.editPayNumber = item.orderNumber;
    },
    getMsgList(params, page = 1) {
      this.$http.getMerMessage(params).then(resp => {
        this.loading = true;
        if (resp && resp.code === 1) {
          let list = resp.data.order;
          this.msgList = page == 1 ? list : this.msgList.concat(list);
          // this.msgList = this.msgList.filter(
          //   item =>
          //     new Date().valueOf() - item.createTime * 1000 < 10 * 60 * 1000
          // );
          this.msgList = this.msgList.filter(item => item.status != 0)
          // console.log(this.msgList)
        }
        let { total } = resp.data;
        if (this.total >= total) {
          this.finished = true;
        }
        this.loading = false;
      });
    },
    onRefresh() {
       this.loading=false;
      this.finished=false;

     this.reload(() => {
        this.$toast.success('刷新成功');
        this.isLoading = false;
      });
    },
     reload(cb) {
      let data = {
        merId: this.getMerId(),
      };
      this.page = 1;
      this.total = 10;
      this.getMsgList(data);
      cb && cb();
    },
    onLoading() {
      this.page = this.page + 1;
      this.total = this.total + 10;
      let data = {
        merId: this.getMerId(),
        page: this.page,
      };
      this.getMsgList(data, this.page);
    },
    // 商户确认退款
    MerAgreeRefund() {
      let data = {
        promoter: 2,
        orderId: this.editOrderId,
        userId: this.getMerId(),
      };
      this.$http.MerAgreeRefund(data).then(resp => {
        let params = {
          userId: this.editUserId,
          payNumber: this.editPayNumber,
        };
        let u = navigator.userAgent,
          app = navigator.appVersion;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
        let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isAndroid) {
          window.Android.refund(JSON.stringify(params));

        } else if (isiOS) {
          window.webkit.messageHandlers.refund.postMessage(
            JSON.stringify(params)
          );
        }
      });
    },
    // 拒绝退款
    disagreeRefund() {
      let data = {
        merId: this.getMerId(),
        orderId: this.editOrderId,
      };
      this.$http.disagreeRefund(data).then(resp => {
        this.disagreeShow = false;
        let timer = null;
        timer = setTimeout(() => {
          this.init();
          clearTimeout(timer);
        }, 200);
        this.$toast.success('已拒绝退货申请');
         this.onRefresh()
      });
    },
    // 退款回调
    refundCallBack(code) {
      // alert(code);
      if (code === '1') {
        let timer = null;
        timer = setTimeout(() => {
          this.init();
          clearTimeout(timer);
        }, 200);
       this.show = false;
        this.$toast.success('同意退货成功');
         this.onRefresh()
      } else {
        this.$toast.fail('同意退货失败，请稍后重试');
      }
      this.show = false;
    },
    // 确认完成退货
    ensureRefundCompleted() {
      let data = {
        promoter: 2,
        userId: this.getUserId(),
        orderId: this.editOrderId,
      };
      this.$http.userEnsureRefund(data).then(resp => {
        this.show1 = false;
        let timer = null;
        timer = setTimeout(() => {
          this.init();
          clearTimeout(timer);
        }, 200);
      });
        this.$toast.success('已确认退货完成');
        this.getMsgList(data);
    },
    // 确认发货
    ensureOrderSend() {
      // console.log(this.data)
      if(this.logisticsType===''||this.logistics ==''){
        this.$toast.fail('请输入物流信息')
        return;
      }
      let data = {
        merId: this.getMerId(),
        orderId: this.editOrderId,
        logisticsType:this.logisticsType,
        logistics:this.logistics 
      };
      console.log(data)
      this.$http.ensureOrderSend(data).then(resp => {
        console.log(resp)
        
        this.show2 = false;
        let timer = null;
        timer = setTimeout(() => {
          this.init();
          clearTimeout(timer);
        }, 200);

        this.$toast.success('已确定发货');
        this.getMsgList(data);
      });
      
    },
    delOrder(id) {
      this.$dialog
        .confirm({
          message: '确定删除吗？',
          confirmButtonColor: '#FFD200',
        })
        .then(() => {
          let data = {
            orderId: id,
            merId: this.getMerId(),
          };
          this.$http.MerDelOrder(data).then(resp => {
            let timer = null;
            timer = setTimeout(() => {
              this.init();
              clearTimeout(timer);
            }, 200);
            this.$toast.success('删除成功');
            this.getMsgList(data);

          });
        });
    },
  },
  mounted() {
    window.refundCallBack = this.refundCallBack;
    this.setBackName('shop-management');
    // this.init();

     this.page =1;
      // this.total = this.total + 10;
      let data = {
        merId: this.getMerId(),
        page: this.page,
      };
      this.getMsgList(data);
  },
};
</script>

<style lang="scss" scoped>
.message {
  height: 100%;
  background: #f8f9fc;
  overflow-x: hidden;
  overflow-y: scroll;
  .msg-item {
    width: 100%;
    min-height: 2.32rem;
    padding: 0 0.2rem;
    display: flex;
    flex-direction: column;
    margin-bottom: 0.1rem;
    background: #fff;
    .item-header {
      height: 0.4rem;
      border-bottom: 1px solid #f1f4fb;
      display: flex;
      align-items: center;
      position: relative;
      p {
        span {
          font-size: 0.15rem;
          font-family: PingFangTC-Regular, PingFangTC;
          font-weight: 400;
          color: rgba(74, 74, 74, 1);
        }
      }
      .fahuo {
        span::before {
          content: '';
          display: inline-block;
          width: 0.12rem;
          height: 0.12rem;
          margin-right: 5px;
          background: url(../../assets/images/fahuo.png) no-repeat center;
          background-size: 100% 100%;
        }
      }
      .tuihuo {
        span::before {
          content: '';
          display: inline-block;
          width: 0.12rem;
          height: 0.12rem;
          margin-right: 5px;
          background: url(../../assets/images/tuihuo.png) no-repeat center;
          background-size: 100% 100%;
        }
      }
      .status {
        position: absolute;
        height: 0.21rem;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto 0;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #000;
        span {
          font-family: PingFangSC-Semibold, PingFang SC;
          font-size: 0.15rem;
          font-weight: 600;
          color: #fc6060;
        }
        i {
          font-family: PingFangSC-Semibold, PingFang SC;
          font-size: 0.15rem;
          font-weight: 600;
          color: #6dd400;
        }
      }
    }
    .desc {
      display: flex;
      margin-top: 0.2rem;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid rgba(241, 244, 251, 1);
      .desc-img {
        min-width: 1.1rem;
        min-height: 1.1rem;
        margin-right: 0.2rem;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .desc-info {
        .text {
          width: 2.05rem;
          margin-top: 0.04rem;
          font-size: 0.15rem;
          font-weight: 400;
          color: rgba(0, 0, 0, 1);
          line-height: 0.21rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .price {
          font-size: 0.12rem;
          margin-bottom: 0.15rem;
          span {
            font-family: Helvetica-Bold, Helvetica;
            font-weight: bold;
            color: rgba(250, 100, 0, 1);
            margin-right: 0.2rem;
          }
          i {
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(144, 144, 144, 1);
          }
        }
        .address {
          .name {
            font-size: 0.12rem;
            font-family: PingFangSC-Semibold, PingFang SC;
            span {
              font-weight: 600;
              color: rgba(0, 0, 0, 1);
              margin-right: 0.1rem;
            }
            i {
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: rgba(144, 144, 144, 1);
            }
          }
          .addressDesc {
            margin-top: 5px;
            font-size: 0.1rem;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(0, 0, 0, 1);
          }
          
          }
          .logistics-msg{
            p{
            margin-top: 5px;
            font-size: 0.1rem;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(0, 0, 0, 1); 
            }
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
        div {
          display: flex;
          justify-content: space-around;
          i {
            padding: 0 6px;
          }
          span {
            padding: 0 12px;
          }
        }
      }
    }
  }
  .msg-item-nomargin {
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
    height: 0.57rem;
    position: absolute;
    left: 0.28rem;
    top: 0.85rem;
    line-height: 0.23rem;
    .logistics{
      // height: 100%;
      font-weight: 400;
      color: rgba(144, 144, 144, 1);
      // text-align: center;
      text-align: left;
      display: flex;
      margin: 2px 0;
      justify-content:space-between;
      input{
        width: 70%;
      }
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
  .list-warp{
    min-height: 7rem;
  }
</style>
