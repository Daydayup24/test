<template>
  <div class="my-address">
    <div class="address-list">
      <div class="list-item"
           v-for="item in addressList"
           :key="item.id"
           @click="chooseAddress(item)">
        <div class="contact">
          <span>{{item.name}}</span>
          <i>{{item.phone}}</i>
        </div>
        <div :class="item.default==1 ? 'default-address' : 'address'">{{item.province}} {{item.city}} {{item.area}} {{item.address}}</div>
        <div class="icon"
             @click.stop="modifyAddress(item)">
          <van-icon name="edit"
                    size=".2rem"
                    color="#8F959A" />
        </div>
      </div>
    </div>
    <div class="address-add"
         @click="$router.push('/add-address')">新增地址</div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: "",
  data () {
    return {
      addressList: [],
      backName: '123'
    }
  },
  components: {},
  methods: {
    ...mapMutations(['setBackName']),
    ...mapGetters(['getProductId', 'getUserId']),
    modifyAddress (item) {
      this.$router.push({
        name: 'modify-address',
        params: {
          area: item,
          position: 'my-address' // 记录来时的地址
        }
      })
    },
    chooseAddress (item) {
      let id = this.getProductId()
      if (!id) { //如果不是从确认订单页面过来的，不执行
        return null
      }
      this.$router.push({
        name: 'confirm-order',
        params: {
          id: item.id,
          selectedAddress: item
        }
      })
    }
  },
  mounted () {
    let id = this.getProductId()
    id ? this.setBackName('confirm-order') : this.setBackName('order-list')
    let data = {
      userId: this.getUserId()
    }
    this.$http.getAddressList(data).then(resp => {
      if (resp && resp.code === 1) {
        this.addressList = resp.data
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.my-address {
  height: 100%;
  background: #f7f8fb;
  .address-list {
    background: #fff;
    .list-item {
      height: 0.97rem;
      border-bottom: 1px solid #f7f8fb;
      padding: 0.1rem 0.6rem 0 0.2rem;
      position: relative;
      .contact {
        margin-bottom: 8px;
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
        line-height: 0.2rem;
      }
      .default-address::before {
        content: "默认";
        font-size: 0.1rem;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        background: #ffd200;
        padding: 0 4px;
        margin-right: 4px;
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
  }
}
.address-add {
  position: absolute;
  top: 0.12rem;
  right: 0.2rem;
  font-weight: 400;
  z-index: 5;
}
</style>
