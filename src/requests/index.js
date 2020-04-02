import axios from 'axios'
import qs from 'qs'
import { Toast } from 'vant'

const ajax = axios.create({
  timeout: 1000 * 30,
  // baseURL: 'http://mall.gchating.com'
  baseURL: 'http://192.168.0.13:8090'
})

let toast1 = null
// http请求拦截器
ajax.interceptors.request.use(
  config => {
    toast1 = Toast.loading({
      message: '加载中...',
      loadingType: 'spinner',
      forbidClick: true,
      duration: 0
    })
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (config.method === 'post') {
      // post请求时，处理数据
      config.data = qs.stringify({
        ...config.data //后台数据接收这块需要以表单形式提交数据，而axios中post默认的提交是json数据,所以这里选用qs模块来处理数据
      })
    }
    // alert(JSON.stringify(config.data))
    return config
  },
  err => {
    let timer = setTimeout(() => {
      Toast.fail({
        message: '请求错误',
        forbidClick: true
      })
      clearTimeout(timer)
    }, 3000)
    return Promise.reject(err)
  }
)

// http响应拦截器
ajax.interceptors.response.use(
  data => {
    // alert(JSON.stringify(data))
    toast1.clear() // 相应成功关闭toast
    if (data.data.code === 1) {
      return data.data
    }
    Toast.fail({
      message: '请求失败\n请稍后再试',
      forbidClick: true
    })
  },
  err => {
    // alert(JSON.stringify(err))
    let timer = setTimeout(() => {
      Toast.fail({
        message: '加载超时',
        forbidClick: true
      })
      clearTimeout(timer)
    }, 3000)
    return Promise.reject(err)
  }
)

// 商户身份查询
export const checkMer = params => {
  return ajax.post('content/api/merchant-check', params)
}

// 获取商家商品列表
export const getMerchantsShopList = params => {
  return ajax.post('content/api/merchant-product', params)
}

// 商品上传
export const uploadShop = params => {
  return ajax.post('/content/api/product-upload', params)
}

// 获取商品详情
export const getShopDetail = data => {
  return ajax.get('/content/api/product-detail', { params: data })
}

// 删除商品
export const deleteShop = params => {
  return ajax.post('/content/api/product-delete', params)
}

// 新增地址
export const addAddress = params => {
  return ajax.post('/content/api/add-address', params)
}

// 获取我的地址列表
export const getAddressList = params => {
  return ajax.post('/content/api/user-address', params)
}

// 创建订单
export const createOrder = parmas => {
  return ajax.post('/content/api/order-create', parmas)
}

// 获取订单列表
export const getOrderList = params => {
  return ajax.post('/content/api/user-order', params)
}

// 获取订单详情
export const getOrderDetail = params => {
  return ajax.post('/content/api/order-detail', params)
}

// 确认收货
export const ensureTrade = params => {
  return ajax.post('/content/api/user-sure-trade', params)
}

// 退货申请
export const returnTrade = params => {
  return ajax.post('/content/api/trade-return', params)
}

// 删除订单
export const delOrder = params => {
  return ajax.post('/content/api/user-delete-order', params)
}

// 获取用户历史足迹
export const getHistory = params => {
  return ajax.post('/content/api/user-scan', params)
}

// 用户确认退款
export const userEnsureRefund = params => {
  return ajax.post('/content/api/return-success', params)
}

// 商家获取消息
export const getMerMessage = params => {
  return ajax.post('/content/api/mer-scan', params)
}

// 商户同意退款
export const MerAgreeRefund = params => {
  return ajax.post('/content/api/return-sure', params)
}

// 商户拒绝退款
export const disagreeRefund = params => {
  return ajax.post('/content/api/return-refuse', params)
}

// 商家删除订单
export const MerDelOrder = params => {
  return ajax.post('/content/api/mer-delete-order', params)
}

// 商家订单发货
export const ensureOrderSend = params => {
  return ajax.post('/content/api/product-send', params)
}

// 清除历史足迹
export const clearHistory = params => {
  return ajax.post('/content/api/user-scan-delete', params)
}

// 获取商品列表
export const getShopList = params => {
  return ajax.post('/content/api/product-list', params)
}
// 获取首页商品列表
export const getShopIndex = params => {
  return ajax.post('/content/api/shop-index', params)
}

// 删除地址
export const delAddress = params => {
  return ajax.post('/content/api/address-delete', params)
}

// 获取地址详情
export const getAddressDetail = params => {
  return ajax.post('/content/api/address-detail', params)
}
// 商户申请
export const applicationShop = params => {
  return ajax.post('/content/api/merchant-apply', params)
}