<template>
  <div class="modify-address">
    <address-edit :action="action"
                  :consignee="consignee"
                  :tel="tel"
                  :address="address"
                  :detail_address="detail_address"
                  :isDefault="isDefault"
                  :addressId="addressId" />
    <div class="address-del"
         @click="delAddress">删除地址</div>
  </div>
</template>

<script type="text/ecmascript-6">
import AddressEdit from '@/components/address-edit/address-edit'
import {mapGetters} from 'vuex'

export default {
  name: "",
  data () {
    return {
      action: 1, //代表修改
      consignee: '',
      tel: '',
      address: '',
      detail_address: '',
      isDefault: false,
      addressId: ''
    }
  },
  components: {
    AddressEdit
  },
  methods: {
    ...mapGetters(['getUserId']),
    delAddress() {
      let params = {
        userId: this.getUserId(),
        addressId: this.addressId
      }
      this.$http.delAddress(params).then(resp => {
        if(resp && resp.code === 1) {
          this.$toast.success('删除成功')
          let timer = null
          timer = setTimeout(() => {
            this.$router.push('/my-address')
            clearTimeout(timer)
          },500)
        }
      })
    }
  },
  created () {
    let { area } = this.$route.params
    this.consignee = area.name
    this.tel = area.phone
    this.address = `${area.province} ${area.city} ${area.area}`
    this.detail_address = area.address
    this.addressId = area.id
    this.isDefault = area.default == 1 ? true : false
  },
  beforeRouteEnter (to, from, next) {
    // if (!to.params.area) {
    //   next('/404')
    // }
    next()
  }
}
</script>

<style lang="scss" scoped>
.modify-address {
  height: 100%;
}
.address-del {
  position: absolute;
  top: 0.12rem;
  right: 0.2rem;
  font-weight: 400;
  z-index: 5;
}
</style>
