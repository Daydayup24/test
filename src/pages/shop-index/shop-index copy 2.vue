<template>
  <div class="shop-list">
    <div class="search">
      <van-search
        class="v-search"
        placeholder="搜索"
        v-model="searchValue"
        show-action
        shape="round"
        @search="onSearch"
      >
        <div slot="action" @click="onSearch">搜索</div>
      </van-search>
      <!-- <img @click="$router.push('/history')" src="@/assets/images/history.png" /> -->
      <img @click="utils.openNewView('/mall/history')" src="@/assets/images/history.png" />
      <img @click="utils.openNewView('/order-list')" src="@/assets/images/my.png" />
    </div>
    <div class="tab-box">
      <div class="title-box">
        <span :class="{active:index==0}" @click="onTabChange(0)">综合推荐</span>
      </div>
      <div class="title-box">
        <span v-if="type!=2" :class="{active:index==2}" @click="onTabChange(1)">销量</span>
        <span v-if="type==2" :class="{active:index==1}" @click="onTabChange(2)">销量</span>
        <div class="title-icon">
          <van-icon
            name="arrow-up"
            color="#8F959A"
            size="0.08rem"
            style="padding: 0 0.1rem"          
            v-if="this.type !=1"
          />
          <van-icon
            name="arrow-up"
            color="#000"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type ==1"
          />
          <van-icon
            name="arrow-down"
            color="#8F959A"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type !=2"
          />
          <van-icon
            name="arrow-down"
            color="#000"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type ==2"
          />
        </div>
      </div>
      <div class="title-box">
        <span v-if="type!=4" :class="{active:index==4}" @click="onTabChange(3)">价格</span>
        <span v-if="type==4" :class="{active:index==3}" @click="onTabChange(4)">价格</span>
        <div class="title-icon">
          <van-icon
            name="arrow-up"
            color="#8F959A"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type !=3"
          />
          <van-icon
            name="arrow-up"
            color="#000"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type ==3"
          />
          <van-icon
            name="arrow-down"
            color="#8F959A"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type !=4"
          />
          <van-icon
            name="arrow-down"
            color="#000"
            size="0.08rem"
            style="padding: 0 0.1rem"
            v-if="this.type ==4"
          />
        </div>
      </div>
    </div>
    <div class="list-box">
      <ul class="content">
        <div class="mer-img">
          <img
            v-if="status==1"
            @click="utils.openNewView('/shop-management')"
            src="@/assets/images/manage-shop.png"
          />
          <img v-else src="@/assets/images/application-shop.png" @click="applicationShop" />
        </div>
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoading"
          class="van-clearfix"
        >
          <div v-for="item in shopList" :key="item.id" @click="goDetail(item.id)" class="list-item">
            <div class="img">
              <img :src="item.headImage" />
            </div>
            <p class="title">{{item.title}}</p>
            <p class="other">
              <span class="price">
                ￥
                <i>{{item.price | getParseInt}}</i>
                .{{item.price | getFloat}}
              </span>
              <!-- <span
                class="inventory"
              >库存：{{item.numberType == 1 ? '不限量' : (item.number<1 ? '缺货' : item.number)}}</span> -->
              <span
                class="inventory"
              >库存：{{item.number}}</span>
            </p>
          </div>
          <div class="clear"></div>
        </van-list>
        <div class="autoFlex"></div>
      </ul>
    </div>

    <!-- <div class="my-history" @click="$router.push('/history')">我的足迹</div> -->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex';
import Bscroll from 'better-scroll';
import { Dialog } from 'vant';
export default {
  name: '',
  data() {
    return {
      isLoading: false,
      searchValue: '',
      index: 0,
      type: 0,
      shopList: [],
      page: 0,
      total: 0,
      loading: false,
      finished: false,
      status: '', //商家状态
      userId:''
    };
  },
  components: {},
  methods: {
    ...mapGetters(['getUserId']),
    ...mapMutations(['setBackName']),
    onSearch() {
      let data = {
        // userId: this.getUserId(),
         userId: this.userId,
        type: this.type,
        page: 1,
        search: this.searchValue,
      };
      this.getShopIndex(data);
    },
    goDetail(id) {
      // this.$router.push({
      //   name: 'detail',
      //   params: {
      //     id,
      //   },
      // });
      let data ='/detail'+'/'+id
      this.utils.openNewView(data)
    },

    getShopIndex(data) {
      // console.log(data)
      this.loading = true;
      let params = data;
      this.$http.getShopIndex(params).then(resp => {
        // console.log('User',resp.data.merData);
        console.log('1还是2')
        if (resp.code == 1) {
          this.status = resp.data.merData.status;
          this.shopList = resp.data.product;
          // let { total } = resp.data;
          if (this.total >= resp.data.total) {
            this.finished = true;
          }
        }else{
          alert(resp)
        }
      });
      this.loading = false;
    },

    onLoading() {
      this.page = this.page + 1;
      this.total = this.total + 10;
     let data = {
        userId: this.getUserId(),
        type: this.type,
        page: this.page,
        search: this.searchValue,
      };
      this.getShopIndex(data);
    },
    // onRefresh() {
    //   this.page = 1;
    //   this.total = 10;
    //   this.searchValue = '';
    //   this.getShopList(this.page, this.searchValue, () => {
    //     this.isLoading = false;
    //     this.$toast('刷新成功');
    //   });
    // },
    onTabChange(index) {
      switch (index) {
        case 0:
          this.index = index;
          this.type = 0; //上传倒叙
          break;
        case 1:
          this.index = index;
          this.type = 2; //2-销量倒叙
          break;
        case 2:
          this.index = index;
          this.type = 1; //1销量升序
          break;
          case 3:
          this.index = index;
          this.type = 4; //4-价格倒叙
          break;
          case 4:
          this.index = index;
          this.type = 3; //4-价格倒叙
          break;
        // default:
        //   this.type = 0; // 全部
        //   break;
      }
      let data = {
        // userId: this.getUserId(),
        userId: this.userId,
        
        type: this.type,
        page: 1,
        search: this.searchValue,
      };
      this.getShopIndex(data);
    },
    applicationShop() {
      if (this.status == -3) {
        Dialog.alert({
          message: '你已提交申请，请耐心等待审核',
        }).then(() => {
          return
        });
      }else{
        Dialog.confirm({
          title: '申请开店',
          message: '是否确定要申请成为商家？',
        })
          .then(() => {
            let data = {
              userId: this.getUserId(),
            };
            this.$http.applicationShop(data).then(resp => {
              if (resp.code == 1) {
                this.$toast('已提交申请，请等待审核。');               
              }
            });
          })
          .catch(() => {
            return;
          });
      }
    },

    getParams (data) {
      if(data){
        this.userId =JSON.parse(data).userId
            let userinfo = {
          userId: this.userId,
          type: 0,
          page: 1,
        };
        this.getShopIndex(userinfo);
      }else{
        this.$toast('获取用户信息失败，请稍后重试')
      }
      // console.log('哈哈',JSON.parse(data).userId)
      // try {
      //   this.setUserId(JSON.parse(data).userId)
      //   this.setMerId(JSON.parse(data).merId)
      // } catch (err) {
      //   this.$toast.fail('获取用户信息失败，请稍后重试')
      // }
    }
  },
  mounted() {
    this.setBackName(null);

    new Bscroll('.list-box', {
      click: true,
    });

    //  let timer = null
    // timer = setInterval(() => {
    //   if (this.getUserId()) {
    //    this.userId =this.getUserId();
    //   let data = {
    //     userId: this.userId,
    //     type: 0,
    //     page: 1,
    //   };
    //   // console.log(data)
    //   this.getShopIndex(data);
    //   }
    // clearInterval(timer)
    // }, 200)
  //  this.$nextTick(function(){
  //       console.log('首页M',this.getUserId());  //输出：修改后的值
  //     });
    console.log('首页M',this.userId)
  },
  created() {
     let that = this
    window.onload = function () {
      window.getParams = that.getParams
      let u = navigator.userAgent, app = navigator.appVersion
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      if (isAndroid) {
        window.Android.getUserInfo()
      } else if (isiOS) {
        window.webkit.messageHandlers.getUserInfo.postMessage('')
      }
    }
    console.log('首页',this.userId)
  //   this.userId =this.getUserId();
  //   if(this.userId){
  //     console.log(this.userId)
  //     let data = {
  //       userId: this.userId,
  //       type: 0,
  //       page: 1,
  //     };
  //     this.getShopIndex(data);
  //   }
  },
};
</script>

<style lang="scss">
.van-list__finished-text {
  background: #f7f8fb;
}
.van-pull-refresh__track {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
<style lang="scss" scoped>
.shop-list {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f7f8fb;
  .search {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 9;
    height: 0.44rem;
    width: 100%;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 0.1rem;
    .v-search {
      height: 100%;
      // padding: 0 0.2rem;
      flex: 1;
    }
    img {
      width: 0.2rem;
      height: 0.22rem;
      margin-left: 0.2rem;
    }
  }
  .list-box {
    flex: 1;
    overflow-x: hidden;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    .van-list {
      padding: 0 0.1rem;
      background: #f7f8fb;
      .list-item {
        width: 1.6rem;
        height: 2.5rem;
        margin-top: 0.11rem;
        background: #fff;
        border-radius: 5px;
        .img {
          width: 1.6rem;
          height: 1.6rem;
          img {
            // width: 100%;
            // height: 100%;
            width: 1.6rem;
            height: 1.6rem;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }
        }
        .title {
          margin-top: 7px;
          height: 0.36rem;
          line-height: 0.18rem;
          padding: 0 6px;
          font-family: PingFangSC-Regular;
          font-size: 0.13rem;
          color: #000000;
          letter-spacing: 0.24px;
          text-align: justify;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .other {
          margin-top: 9px;
          height: 0.2rem;
          padding: 0 6px;
          display: flex;
          justify-content: space-between;
          .price {
            font-family: Helvetica;
            font-size: 0.12rem;
            color: #fb6f00;
            letter-spacing: 0.22px;
            text-align: justify;
            i {
              font-size: 0.16rem;
              font-weight: bold;
            }
          }
          .inventory {
            font-family: PingFangSC-Regular;
            font-size: 0.12rem;
            color: #909090;
            letter-spacing: 0.22px;
            text-align: justify;
          }
        }
      }
      .list-item:nth-child(odd) {
        // margin-right: 5px;
        float: left;
      }
      .list-item:nth-child(even) {
        // margin-right: 5px;
        float: right;
      }
      .clear {
        clear: both;
      }
    }
    .autoFlex {
      flex: 1;
      background: #f7f8fb;
    }
  }
}

.tab-box {
  width: 100%;
  display: flex;
  justify-content: space-around;
  height: 0.36rem;
  align-items: center;
  .title-box {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909090;
    font-size: 0.12rem;

    .active {
      color: #000000;
      line-height: 0.36rem;
      border-bottom: 2px solid #f7b500;
      font-weight: bold;
    }
    .title-icon {
      display: flex;
      flex-direction: column;
      // margin-left: 10px;
    }
  }
}
.mer-img {
  width: 100%;
  padding: 0 0.1rem;
  margin: 1px 0;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
