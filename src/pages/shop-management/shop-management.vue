<template>
  <div class="shopList" v-if="isDataBack">
    <div class="none" v-if="products.length == 0">
      <div class="img">
        <div class="logo"></div>
        <p>你还没有上架任何商品！</p>
      </div>
      <button class="upLoad" @click="$router.push('/shop-upload')">立即上架</button>
    </div>
    <div class="list" v-else>
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoading"
        :immediate-check="false"
      >
        <div
          :class="i==products.length-1 ? 'list-item list-item-finished' : 'list-item'"
          v-for="(item, i) in products"
          :key="item.id"
        >
          <div class="desc" @click="goDetail(item)">
            <div class="desc-img">
              <img :src="item.headImage" />
            </div>
            <div class="desc-info">
              <div class="text">{{item.title}}</div>
              <div class="price">
                <span>￥</span>
                {{item.price.split('.')[0]}}
                <span>.{{item.price.split('.')[1]}}</span>
              </div>
              <div class="inventory">
                <span>库存：{{item.number}}</span>
                <em>已售：{{item.sellOut}}</em>
              </div>
            </div>
          </div>
          <div class="edit-btn" v-if="item.status==1">
            <div class="btn share" @click="share(item)">
              <span>分享</span>
            </div>
            <div class="btn edit" @click="shopEdit(item.id)">
              <span>编辑</span>
            </div>
            <div class="btn del" @click="del(item.id)">
              <span>删除</span>
            </div>
          </div>
          <div class="edit-btn" v-else>
            <div class="btn audit">
              <span>审核中</span>
            </div>
            <div class="btn del" @click="del(item.id)">
              <span>删除</span>
            </div>
          </div>
        </div>
      </van-list>
    </div>
    <div class="btn-msg" @click="goMessage">
      <div class="msg" v-if="scanCount==0"></div>
      <van-goods-action-icon class="msg" :info="scanCount" v-else />
    </div>
    <div class="l-footer" v-if="products.length != 0">
      <button class="btn-upload" @click="$router.push('/shop-upload')">继续上架</button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex';

export default {
  name: '',
  data() {
    return {
      isLoading: false,
      products: [],
      scanCount: 0,
      loading: false,
      finished: false,
      page: 1,
      total: 10,
      isDataBack: false,
    };
  },
  components: {},
  methods: {
    ...mapMutations(['setBackName', 'setMerId']),
    ...mapGetters(['getUserId', 'getMerId']),
    onRefresh() {
      this.isLoading = true
      this.init()
      this.$toast('刷新成功')
      this.isLoading = false
    },
    init() {
      let data = { merId: this.getMerId() };
      this.page = 1;
      this.total = 10;
      this.getProducts(data);
    },
    getProducts(params, page = 1) {
      this.$http.getMerchantsShopList(params).then(resp => {
        this.loading = true;
        if (resp && resp.code === 1) {
          let list = resp.data.products;
          this.products = page == 1 ? list : this.products.concat(list);
        }
        this.scanCount = resp.data.scanCount > 99 ? '99+' : resp.data.scanCount;
        let { total } = resp.data;
        if (this.total >= total) {
          this.finished = true;
        }
        this.loading = false;
        this.isDataBack = true;
      });
    },
    onLoading() {
      this.page = this.page + 1;
      this.total = this.total + 10;
      let data = {
        merId: this.getMerId(),
        page: this.page,
      };
      this.getProducts(data, this.page);
    },
    shopEdit(id) {
      this.$router.push({
        name: 'shop-upload',
        params: {
          id,
        },
      });
    },
    del(id) {
      this.$dialog
        .confirm({
          message: '确定删除吗？',
          confirmButtonColor: '#FFD200',
        })
        .then(() => {
          let data = {
            productId: id,
            merId: this.getMerId(),
          };
          this.$http.deleteShop(data).then(resp => {
            this.$toast.success('删除成功');
            this.init();
          });
        })
        .catch(() => {});
    },
    share(item) {
      item.shareUrl = `${location.origin}/mall/detail/${item.id}`;
      let u = navigator.userAgent,
        app = navigator.appVersion;
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if (isAndroid) {
        window.Android.share(JSON.stringify(item));
      } else if (isiOS) {
        window.webkit.messageHandlers.share.postMessage(JSON.stringify(item));
      }
    },
    goDetail(item) {
      if (item.status != 1) return;
      this.$router.push({
        name: 'detail',
        params: {
          id: item.id,
        },
      });
    },
    goMessage() {
      this.$router.push('/message');
    },
  },
  mounted() {
    this.$toast.loading({
      message: '加载中...',
      loadingType: 'spinner',
      forbidClick: true,
      duration: 0,
    });
    this.setBackName(null);
    let timer = null;
    timer = setInterval(() => {
      if (this.getUserId()) {
        let data = {
          userId: this.getUserId(),
        };
        this.$http.checkMer(data).then(resp => {
          // alert(JSON.stringify(resp.data))
          if(resp && resp.code == 1) {
            this.setMerId(resp.data.merId)
            // this.setMerId(14)
          }
          this.init();
        })
        clearInterval(timer);
      }
    }, 500);
  },
};
</script>

<style lang="scss" scoped>
.shopList {
  height: 100%;
  background: #f6f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .none {
    height: 100%;
    position: relative;
    background: #fff;
    .img {
      position: absolute;
      top: 1.1rem;
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 1.86rem;
      height: 1.79rem;
      .logo {
        width: 100%;
        height: 1.29rem;
        background: url(../../assets/images/none.png) no-repeat center;
        background-size: 100% 100%;
        margin-bottom: 0.3rem;
      }
      p {
        text-align: center;
        font-weight: 400;
        color: rgba(0, 0, 0, 1);
      }
    }
    .upLoad {
      position: absolute;
      bottom: 1.8rem;
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 2.55rem;
      height: 0.6rem;
      background: rgba(0, 0, 0, 1);
      border-radius: 0.3rem;
      border: 4px solid rgba(255, 210, 0, 1);
      font-size: 0.16rem;
      font-weight: 600;
      color: rgba(255, 210, 0, 1);
      text-align: center;
      line-height: 0.6rem;
    }
  }

  .list {
    flex: 1;
    overflow-x: hidden;
    overflow-y: scroll;
    .list-item {
      width: 100%;
      height: 1.91rem;
      padding: 0.2rem 0.2rem 0;
      display: flex;
      flex-direction: column;
      margin-bottom: 0.1rem;
      background: #fff;
      .desc {
        display: flex;
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
            vertical-align: middle;
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
            display: flex;
            justify-content: space-between;
            margin-top: 0.02rem;
            // padding-right: 0.12rem;
            margin-right: 0.25rem;
            font-size: 0.12rem;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(144, 144, 144, 1);
          }
        }
      }
      .edit-btn {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .btn {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 0.2rem;
          border-right: 1px solid rgba(216, 216, 216, 1);
          span {
            font-size: 0.14rem;
            font-weight: 400;
            color: rgba(144, 144, 144, 1);
          }
          span::before {
            content: '';
            display: inline-block;
            vertical-align: middle;
            width: 0.12rem;
            height: 0.12rem;
            margin-right: 0.04rem;
          }
        }
        .share {
          span::before {
            background: url(../../assets/images/share.png) no-repeat center;
            background-size: 100% 100%;
          }
        }
        .edit {
          span::before {
            background: url(../../assets/images/edit.png) no-repeat center;
            background-size: 100% 100%;
          }
        }
        .del {
          border-right: 0;
          span {
            color: rgba(252, 96, 96, 1);
          }
          span::before {
            width: 0.12rem;
            height: 0.13rem;

            background: url(../../assets/images/del.png) no-repeat center;
            background-size: 100% 100%;
          }
        }
        .audit {
          span::before {
            background: url(../../assets/images/fahuo.png) no-repeat center;
            background-size: 100% 100%;
          }
        }
      }
    }
    .list-item-finished {
      margin-bottom: 0;
    }
  }
  .l-footer {
    height: 0.5rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    .btn-upload {
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
  }
}
.btn-msg {
  position: absolute;
  width: 0.21rem;
  height: 0.23rem;
  top: 0.11rem;
  right: 0.2rem;
  .msg {
    min-width: initial;
    width: 100%;
    height: 100%;
    background: url(../../assets/images/btn_msg.png) no-repeat center;
    background-size: 100% 100%;
  }
}
</style>
