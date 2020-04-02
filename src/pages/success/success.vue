<template>
  <div class="success">
    <div class="info-img"></div>
    <div class="img">
      <div class="logo"></div>
      <p>你已成功购买商品，请等待卖家发货！</p>
    </div>
    <button class="upLoad"
            @click="goOderList">查看订单</button>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations } from 'vuex'
export default {
  name: "",
  data () {
    return {}
  },
  components: {},
  methods: {
    ...mapMutations(['setBackName', 'setProductId']),
    goOderList () {
      this.$router.push('/order-list')
    }
  },
  mounted () {
    this.setBackName('order-list')
    this.setProductId('')
  }
}
</script>

<style lang="scss" scoped>
.success {
  height: 100%;
  position: relative;
  .info-img {
    height: 1.25rem;
    background: url(../../assets/images/pay_success.png) no-repeat center;
    background-size: 100% 100%;
  }
  .img {
    position: absolute;
    top: 2rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    height: 1.79rem;
    .logo {
      width: 1.86rem;
      height: 1.29rem;
      background: url(../../assets/images/payment_success.png) no-repeat center;
      background-size: 100% 100%;
      margin: 0 auto;
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
    top: 4.6rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 1.45rem;
    height: 0.4rem;
    border-radius: 20px;
    border: 1px solid rgba(247, 181, 0, 1);
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(247, 181, 0, 1);
    text-align: center;
    line-height: 0.4rem;
  }
}
</style>
