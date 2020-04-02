<template>
  <div class="order-list">
    <div class="nav">
      <div class="search">
        <van-search
          class="v-search"
          placeholder="搜索"
          v-model="searchValue"
          show-action
          shape="round"
          @search="onSearch"
          @focus="stopScroll"
          @blur="removeStopScroll"
        >
          <div slot="action" @click="onSearch">搜索</div>
        </van-search>
      </div>
      <div class="tab">
        <van-tabs
          v-model="active"
          type="line"
          :border="false"
          title-active-color="#F7B500"
          title-inactive-color="#909090"
          color="#F7B500"
          line-width=".2rem"
          :swipe-threshold="5"
          @change="onTabChange"
        >
          <van-tab v-for="item in tabTitle" :key="item" :title="item">
            <van-pull-refresh v-model="isLoading" @refresh="onRefresh" class="list-warp">
              <van-list
                v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoading"
                :immediate-check="false"
              >
                <order-list
                  :orderList="orderList"
                  @delOrder="onDelOrder"
                  @ensureTrade="onEnsureTrade"
                  @returnTrade="onReturnTrade"
                  @ensureRefund="onEnsureRefund"
                  ref="listComponent"
                />
              </van-list>
            <!-- <div class="autoFlex">没有更多了</div> -->
            </van-pull-refresh>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div class="address-btn" @click="$router.push('/my-address')">收货地址</div>
  </div>
</template>

<script type="text/ecmascript-6">
import orderList from '@/components/order-list/order-list';
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: '',
  data() {
    return {
      isLoading: false,
      searchValue: '',
      active: 0,
      tabTitle: ['全部', '待支付', '待发货', '待收货', '退款订单'],
      orderList: [],
      page: 1,
      type: 99, // 99完成  1待发货  2待收货  3已完成  -99退款订单
      total: 10,
      loading: false,
      finished: false,
    };
  },
  components: {
    orderList,
  },
  methods: {
    ...mapGetters(['getUserId', 'getMerId']),
    ...mapMutations(['setBackName']),
    stopScroll() {
      // document.body.addEventListener('touchmove', function (e) {
      //   e = e || event
      //   e.stopPropagation()
      //   e.preventDefault()
      // })
    },
    removeStopScroll() {
      // document.body.removeEventListener('touchmove', function (e) {
      //   e = e || event
      //   e.stopPropagation()
      //   e.preventDefault()
      // })
    },
    // 下拉刷新
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
        userId: this.getUserId(),
        type: this.type,
        content:this.searchValue
      };
      this.page = 1;
      this.total = 10;
      this.getOrderList(data);
      cb && cb();
    },
    onDelOrder(orderId) {
      this.$dialog
        .confirm({
          message: '确定删除吗？',
          confirmButtonColor: '#FFD200',
        })
        .then(() => {
          let data = {
            orderId,
            userId: this.getUserId(),
          };
          this.$http.delOrder(data).then(resp => {
            this.$toast.success('删除成功');
            this.orderList = this.orderList.filter(item => item.id !== orderId);
          });
        })
        .catch(() => {});
    },
    onEnsureTrade(orderId) {
      let data = {
        userId: this.getUserId(),
        orderId,
      };
      this.$http.ensureTrade(data).then(resp => {
        if (resp && resp.code === 1) {
          this.$toast.success('收货成功');
        } else {
          this.$toast.fail('收货失败，请稍后重试');
        }
        this.$refs.listComponent[0].show = false;
        this.$forceUpdate();
        let timer = null;
        timer = setTimeout(() => {
          this.reload();
          clearTimeout(timer);
        }, 1000);
      });
    },
    onReturnTrade(obj) {
      
      let data = {
        userId: this.getUserId(),
        orderId: obj.orderId,
        remark: obj.isSelectedFirst ? '我要退款（无需退货）' : '我要退货退款',
      };
      this.$http.returnTrade(data).then(resp => {
        this.$toast.success('退款申请成功');
        // this.$set(this.$refs.listComponent, 'show1', false)
        this.$refs.listComponent[0].show1 = false;
        this.$forceUpdate();
        let timer = null;
        timer = setTimeout(() => {
          this.reload();
          clearTimeout(timer);
        }, 1000);
      });
    },
    onEnsureRefund(orderId) {
      let data = {
        promoter: 1,
        userId: this.getUserId(),
        orderId,
      };
      this.$http.userEnsureRefund(data).then(resp => {
        if (resp && resp.code === 1) {
          this.$toast.success('确认退款成功');
          this.$refs.listComponent[0].show2 = false;
          this.$forceUpdate();
          let timer = null;
          timer = setTimeout(() => {
            this.reload();
            clearTimeout(timer);
          }, 1000);
        }
      });
    },
    getOrderList(params, page = 1, index) {
      this.loading = true;
      this.$http.getOrderList(params).then(resp => {
        console.log('哈哈')
        if (resp && resp.code === 1) {
          let list = resp.data.order;
          this.orderList = page == 1 ? list : this.orderList.concat(list);
          if (index && index === 1) {
            this.orderList = this.orderList.filter(
              item =>
                new Date().valueOf() - item.createTime * 1000 < 10 * 60 * 1000
            );
          }
          let { total } = resp.data;
          if (this.total >= total) {
            this.finished = true;
          }
        }
        this.loading = false;
      });
    },
    onLoading() {     
      this.page = this.page + 1;
      this.total = this.total + 10;
      let data = {
        userId: this.getUserId(),
        page: this.page,
        type: this.type,
        content:this.searchValue
      };
      this.getOrderList(data, this.page);
    },
    onTabChange(index) {
      switch (index) {
        case 1:
          this.type = 0; //待支付
          break;
        case 2:
          this.type = 1; //待发货
          break;
        case 3:
          this.type = 2; //待收货
          break;
        case 4:
          this.type = -99; //退款订单
          break;
        default:
          this.type = 99; // 全部
          break;
      }
      this.page = 1;
      this.total = 10;
      let data = {
        userId: this.getUserId(),
        type: this.type,
        content:this.searchValue
      };
      // this.getOrderList(data, 1, index);
      
    // this.loading=false;
    // this.finished=false;

    //   let timer = null;
    // timer = setTimeout(() => {
     
    //   this.onRefresh();
    //   clearTimeout(timer)
    // }, 200);

     this.reload(() => {
        this.$toast.success('刷新成功');
        this.isLoading = false;
      });
    },
    onSearch() {
      // if (this.searchValue == '') return;
      let data = {
        userId: this.getUserId(),
        content: this.searchValue,
        type: this.type,
      };
      this.page = 1;
      this.total = 10;
      this.getOrderList(data);
    },
  },
  mounted() {
    this.setBackName(null);
    let timer = null;
    timer = setInterval(() => {
      if (this.getUserId()) {
        let data = {
          userId: this.getUserId(),
        };
        this.getOrderList(data);
        clearInterval(timer);
      }
    }, 200);
  },
};
</script>

<style lang="scss">
.tab {
  .van-tabs__wrap {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    // padding: 0 0.2rem;
    z-index: 9;
  }
}
.van-list__finished-text {
  background: #f7f8fb;
}
</style>
<style lang="scss" scoped>
.order-list {
  height: 100%;
  background: #fff;
  .nav {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .search {
      position: -webkit-sticky;
      position: sticky;
      top: 0;
      z-index: 9;
      height: 0.44rem;
      .v-search {
        height: 100%;
        padding: 0 0.2rem;
        padding-bottom: 6px;
      }
    }
    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: scroll;
      background-color: #f7f8fb;
      // .autoFlex {
      //   // flex: 1;
      //   height: 0.44rem;
      //   color: #909090;
      //   line-height: 0.44rem;
      //   text-align: center;
      //   background: #f7f8fb;
      // }
    }
  }
}
.address-btn {
  position: absolute;
  top: 0.12rem;
  right: 0.2rem;
  font-weight: 400;
  z-index: 5;
}
.list-warp {
  height: 100%;
  background-color: #f7f8fb;
  min-height: 6.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

}
</style>
