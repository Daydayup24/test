<template>
  <div class="history">
    <div class="none"
         v-if="historyList.length==0">
      <div class="img">
        <div class="logo"></div>
        <p>你还没有浏览任何商品！</p>
      </div>
    </div>

    <div class="list"
         v-if="historyList.length">
      <div class="list-item"
           v-for="item in historyList"
           :key="item.id">
        <div class="item-header">
          <!-- <div class="shop-avatar"></div> -->
          <div class="shop-name">{{item.username}}</div>
          <div class="right">
            <van-icon name="arrow"
                      size=".14rem" />
          </div>
        </div>
        <div class="desc"
             @click="goDetail(item.id)">
          <div class="desc-img">
            <img :src="item.headImage" />
          </div>
          <div class="desc-info">
            <div class="text">{{item.title}}</div>
            <div class="price"><span>￥</span>{{item.price | getParseInt}}<span>.{{item.price | getFloat}}</span></div>
            <div class="inventory">浏览时间：{{item.createTime}}</div>
          </div>
        </div>
      </div>
    </div>
    <div :class="historyList.length ? 'clear' : 'clear clear-grey'"
         @click="clearHistory"><span>清除记录</span></div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: "",
  data () {
    return {
      historyList: []
    }
  },
  components: {},
  methods: {
    ...mapGetters(['getUserId', 'getMerId']),
    ...mapMutations(['setBackName']),
    goDetail (id) {
      this.$router.push({
        name: 'detail',
        params: {
          id
        }
      })
    },
    getHistoryList () {
      let data = { userId: this.getUserId() }
      this.$http.getHistory(data).then(resp => {
        if (resp && resp.code === 1) {
          this.historyList = resp.data
        }
      })
    },
    clearHistory () {
      if (!this.historyList.length) {
        return
      }
      this.$dialog.confirm({
        message: '确定清除吗？',
        confirmButtonColor: '#FFD200'
      }).then(() => {
        let data = {
          userId: this.getUserId()
        }
        this.$http.clearHistory(data).then(resp => {
          this.$toast.success('清除成功')
          this.getHistoryList()
        })
      }).catch(err => { })
    }
  },
  mounted () {
    this.setBackName('index')
    let timer = null
    timer = setInterval(() => {
      if (this.getUserId()) {
        this.getHistoryList()
        clearInterval(timer)
      }
    }, 200)
  }
}
</script>

<style lang="scss" scoped>
.history {
  height: 100%;
  .none {
    height: 100%;
    position: relative;
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
  }
  .list {
    height: 100%;
    .list-item {
      width: 100%;
      height: 1.91rem;
      padding: 0 0.2rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 0.1rem;
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
    }
  }
}
.clear {
  position: absolute;
  top: 0.12rem;
  right: 0.2rem;
  font-weight: 400;
  z-index: 5;
}
.clear-grey {
  color: rgba(144, 144, 144, 1);
}
</style>
