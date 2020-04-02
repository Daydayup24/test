<template>
  <div class="shop-upload">
    <div class="sc title">
      <p>标题</p>
      <input type="text"
             placeholder="请输入标题"
             v-model="title"
             @focus="titleNull=false;stopScroll"
             @blur="removeStopScroll" />
      <i v-show="titleNull">请输入标题!</i>
    </div>
    <div class="sc price">
      <p>价格</p>
      <input type="number"
             placeholder="￥0.00"
             v-model="price"
             @focus="priceNull=false;stopScroll"
             @blur="removeStopScroll" />
      <i v-show="priceNull">请输入正确的价格!</i>
    </div>
    <div class="sc inventory">
      <p>库存(<span>数字“0”表示不限量)</span></p>
      <input type="number"
             placeholder="0"
             v-model="number"
             @focus="stopScroll"
             @blur="removeStopScroll" />
    </div>
    <div class="sc desc">
      <p>商品描述</p>
      <textarea placeholder="请输入商品描述"
                v-model="describe"
                @focus="stopScroll"
                @blur="removeStopScroll"></textarea>
                <i v-show="describeNull">请描述商品!</i>
    </div>
    <div class="up-footer"
         @click="imgError=false"
         v-show="hideShow">
      <!-- <van-uploader v-model="imageUpload"
                    multiple
                    :max-count="5"
                    preview-size=".6rem"
                    :after-read="afterRead">
      </van-uploader> -->
      <div v-for="(item, i) in imageUpload"
           :key="i"
           :class="i==4 ? 'up-imgs-item up-imgs-item-last' : 'up-imgs-item'">
        <img :src="item"
             @click="viewImage(item)"
             ref="img" />
        <van-icon name="cross"
                  size=".1rem"
                  color="#fff"
                  @click="delPhoto(i)" />
      </div>
      <div class="uploader"
           v-show="imageUpload.length<5"
           @click="openMobilePhotoAlbum">
        <van-icon name="plus"
                  size=".3rem"
                  color="#ccc" />
      </div>
      <i v-show="imgError">图片不得少于两张!</i>
    </div>
    <button class="btn-upload"
            @click="upload">发布商品</button>
    <van-image-preview v-model="imgShow"
                       :images="imgPreView"
                       :show-index="false" />
    <!-- 弹框 -->
    <div class="dialog"
         v-show="show">
      <div class="t-title">
        <button class="close"
                @click="show = false">
          <van-icon name="cross"
                    size=".14rem" />
        </button>
        <span>上架申请成功</span>
      </div>
      <div class="content">
        <p>上架申请成功，该商品在审核通过后即可分享给好友购买！</p>
        <p>审核期间将不可分享，不可编辑！</p>
      </div>
      <div class="ok-btn"
           @click="show = false;$router.push('/shop-management')">确 认</div>
    </div>
    <van-overlay :show="show" />
  </div>
</template>

<script type="text/ecmascript-6">
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: "",
  data () {
    return {
      show: false,
      titleNull: false,
      priceNull: false,
      imgError: false,
      describeNull:false,
      title: '',
      price: '',
      number: '',
      numberType: '',
      describe: '',
      productId: '',
      imageUpload: [],
      backName: '',
      docmHeight: document.documentElement.clientHeight || document.body.clientHeight,
      showHeight: document.documentElement.clientHeight || document.body.clientHeight,
      hideShow: true, //显示或隐藏footer
      imgShow: false,
      imgPreView: [],
      upImg_compress: []
    }
  },
  components: {},
  methods: {
    ...mapMutations(['setBackName', 'setProductId']),
    ...mapGetters(['getMerId']),
    afterRead (file) {
      console.log(file)
    },
    stopScroll () {
      // document.body.addEventListener('touchmove', function (e) {
      //   e = e || event
      //   e.stopPropagation()
      //   e.preventDefault()
      // })
    },
    removeStopScroll () {
      // document.body.removeEventListener('touchmove', function (e) {
      //   e = e || event
      //   e.stopPropagation()
      //   e.preventDefault()
      // })
    },
    delPhoto (i) {
      this.imageUpload.splice(i, 1)
    },
    viewImage (item) {
      this.imgShow = true
      this.imgPreView.splice(0) // 清空数组
      this.imgPreView.push(item)
    },
    dealImage (base64, w, callback) {
      var newImage = new Image();
      var quality = 0.6;    //压缩系数0-1之间
      newImage.src = base64;
      newImage.setAttribute("crossOrigin", 'Anonymous');	//url为外域时需要
      var imgWidth, imgHeight;
      newImage.onload = function () {
        imgWidth = this.width;
        imgHeight = this.height;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        if (Math.max(imgWidth, imgHeight) > w) {
          if (imgWidth > imgHeight) {
            canvas.width = w;
            canvas.height = w * imgHeight / imgWidth;
          } else {
            canvas.height = w;
            canvas.width = w * imgWidth / imgHeight;
          }
        } else {
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          quality = 0.6;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
        // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
        // while (base64.length / 1024 > 150) {
        // 	quality -= 0.01;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        // while (base64.length / 1024 < 50) {
        // 	quality += 0.001;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
      }
    },
    useImg (base64) {
      var str = base64
      this.upImg_compress.push(str)
    },
    getImgSize (base64url) {
      //获取base64图片大小，返回KB数字
      var str = base64url.replace('data:image/png;base64,', '');//这里根据自己上传图片的格式进行相应修改
      var strLength = str.length;
      var fileLength = parseInt(strLength - (strLength / 8) * 2);
      // 由字节转换为KB
      var size = "";
      size = (fileLength / 1024).toFixed(2);
      return parseInt(size);
    },
    upload () {
      let priceReg = /^(?:0\.\d{0,1}[1-9]|(?!0)\d{1,6}(?:\.\d{0,1}[0-9])?)$/  //价格规则
      let flag = true
      if (this.title === '') {
        this.titleNull = true
        flag = false
      }
      if (this.price === '' || !priceReg.test(this.price)) {
        this.priceNull = true
        flag = false
      }
      if (this.imageUpload.length < 2) {
        this.imgError = true
        flag = false
      }
      if(this.describe===''){
        this.describeNull=true
         flag = false
      }
      if (flag) { // 验证通过
        let size = 0
        this.imageUpload.forEach(item => {
          if (item.startsWith('data')) {
            size += this.getImgSize(item)
          }
        })
        if (size > 20 * 1024) {
          this.$toast('上传的图片不能超过20M')
          return
        }
        let data = {
          merId: this.getMerId(),
          title: this.title,
          price: this.price,
          number: this.number,
          numberType: (this.number == 0 || this.number == '') ? 1 : 2,
          describe: this.describe,
          imageUpload: this.imageUpload
        }
        //['data:image/png;base64,iVBORw0KGgo=','data:image/png;base64,iVBORw0KGgo=']
        // 有productId是修改，没有则是新增
        if (this.productId) {
          data.productId = this.productId
        }
        this.$http.uploadShop(data).then(resp => {
          // alert(resp.code)
          // // console.log(resp)
          // this.show = true

          if(resp.code==1){
            this.show = true
          }
        })
      }
    },
    openMobilePhotoAlbum () { // 打开原生相册
      let count = this.imageUpload.length // 已经选择了几张图片
      let u = navigator.userAgent, app = navigator.appVersion
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      if (isAndroid) {
        window.Android.opemAlbum(count)
      } else if (isiOS) {
        window.webkit.messageHandlers.opemAlbum.postMessage(count)
      }
    },
    getPhotos (data) {
      if (!data) {
        this.$toast('图片加载失败，请重试')
        return
      }
      data = `${data}`
      let imgArr = data.split('|')
      imgArr = imgArr.map(item => {
        item = `data:image/png;base64,${item}`
        return item
      })
      // imgArr.forEach(item => {
      //   let base64 = item
      //   this.dealImage(base64, 500, this.useImg)
      // })
      this.imageUpload = this.imageUpload.length ? [...this.imageUpload, ...imgArr] : [...imgArr]
    }
  },
  mounted () {
    window.getPhotos = this.getPhotos
    this.$nextTick(() => {

      // if (this.backName == 'detail') {
      //   this.setProductId(this.$route.params.id)
      // }
      this.setBackName('shop-management')
      //监听事件
      window.onresize = () => {
        return (() => {
          this.showHeight = document.documentElement.clientHeight || document.body.clientHeight;
        })()
      }
    })
  },
  watch: {
    //监听显示高度
    showHeight: function () {
      if (this.docmHeight > this.showHeight) {
        //隐藏
        this.hideShow = false
      } else {
        //显示
        this.hideShow = true
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    let { id } = to.params
    if (id) {
      let data = {
        productId: id
      }
      next(vm => {
        vm.backName = from.name
        vm.$http.getShopDetail(data).then(resp => {
          let { data } = resp
          vm.title = data.title
          vm.price = data.price
          vm.number = data.number
          vm.describe = data.describe
          let { image } = data
          let img = []
          image.forEach(item => {
            img.push(item)
          })
          vm.imageUpload = img
          vm.upImg_compress.push(img)
          vm.productId = id
        })
      })
    }
    else {
      next(vm => {
        vm.backName = from.name
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-upload {
  background: #f6f7fa;
  height: 100%;
  display: flex;
  flex-direction: column;
  .sc {
    width: 100%;
    height: 0.7rem;
    background: #fff;
    padding: 0.1rem 0.2rem 0;
    margin-bottom: 0.05rem;
    position: relative;
    p {
      font-size: 0.12rem;
      font-weight: 400;
      margin-bottom: 0.1rem;
    }
    input {
      width: 100%;
      height: 0.2rem;
      line-height: 0.2rem;
      font-size: 0.15rem;
      font-weight: 600;
      border: 0;
    }
    i {
      position: absolute;
      right: 0.2rem;
      font-size: 0.12rem;
      color: #ee0a24;
    }
    i::before {
      content: "";
      display: inline-block;
      width: 0.1rem;
      height: 0.1rem;
      vertical-align: middle;
      margin-right: 2px;
      background: url(../../assets/images/tuihuo.png) no-repeat center;
      background-size: 100% 100%;
    }
  }
  .title {
    p {
      color: rgba(247, 181, 0, 1);
    }
    input {
      color: rgba(0, 0, 0, 1);
    }
  }
  .price {
    p {
      color: rgba(144, 144, 144, 1);
    }
    input {
      color: rgba(144, 144, 144, 1);
    }
    input::before {
      content: "￥";
      display: inline;
    }
  }
  .inventory {
    p {
      color: rgba(144, 144, 144, 1);
      span {
        color: #fc6060;
      }
    }
    input {
      color: rgba(144, 144, 144, 1);
    }
  }
  .desc {
    flex: 1;
    display: flex;
    flex-direction: column;
    p {
      color: rgba(144, 144, 144, 1);
    }
    textarea {
      flex: 1;
      width: 100%;
      border: 0;
    }
  }
  .up-footer {
    width: 100%;
    height: 1rem;
    padding: 0.2rem 0.15rem 0.2rem 0.2rem;
    background: #fff;
    position: relative;
    display: flex;
    justify-content: flex-start;
    .up-imgs-item {
      width: 0.6rem;
      height: 0.6rem;
      margin-right: 0.1rem;
      position: relative;
      img {
        width: 100%;
        height: 100%;
      }
      .van-icon-cross {
        position: absolute;
        right: -0.08rem;
        top: -0.08rem;
        background: #969799;
        border-radius: 50%;
        width: 0.18rem;
        height: 0.18rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #fff;
      }
    }
    .up-imgs-item-last {
      margin-right: 0;
    }
    .uploader {
      width: 0.6rem;
      height: 0.6rem;
      border: 1px dashed #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    > i {
      position: absolute;
      right: 0.2rem;
      font-size: 0.12rem;
      color: #ee0a24;
    }
    > i::before {
      content: "";
      display: inline-block;
      width: 0.1rem;
      height: 0.1rem;
      vertical-align: middle;
      margin-right: 2px;
      background: url(../../assets/images/tuihuo.png) no-repeat center;
      background-size: 100% 100%;
    }
  }
}
.btn-upload {
  position: absolute;
  top: 1px;
  right: 0.13rem;
  width: 0.96rem;
  height: 0.41rem;
  background: rgba(0, 0, 0, 1);
  border-radius: 0.25rem;
  border: 2px solid rgba(255, 210, 0, 1);
  line-height: 0.37rem;
  font-weight: 600;
  color: rgba(255, 210, 0, 1);
  text-align: center;
}
.dialog {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  padding: 0 0.18rem;
  width: 3.15rem;
  height: 2.98rem;
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
    height: 0.92rem;
    position: absolute;
    left: 0.28rem;
    top: 0.7rem;
    line-height: 0.23rem;
    p {
      font-weight: 400;
      color: rgba(144, 144, 144, 1);
    }
    p:nth-child(1) {
      margin-bottom: 0.23rem;
    }
  }
  .ok-btn {
    position: absolute;
    top: 2.01rem;
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
