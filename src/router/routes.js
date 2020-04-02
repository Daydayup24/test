const ShopManagement = () => import('@/pages/shop-management/shop-management')
const ShopUpload = () => import('@/pages/shop-upload/shop-upload')
const Detail = () => import('@/pages/detail/detail')
const History = () => import('@/pages/history/history')
const OrderList = () => import('@/pages/order-list/order-list')
const OrderDetail = () => import('@/pages/order-detail/order-detail')
const MyAddress = () => import('@/pages/my-address/my-address')
const AddAddress = () => import('@/pages/add-address/add-address')
const ModifyAddress = () => import('@/pages/modify-address/modify-address')
const ConfirmOrder = () => import('@/pages/confirm-order/confirm-order')
const Success = () => import('@/pages/success/success')
const Message = () => import('@/pages/message/message')
const List = () => import('@/pages/list/list')
const ShopIndex =()=> import('@/pages/shop-index/shop-index')
const routes = [
  {
    path: '/',
    // redirect: '/history'
    redirect: '/shop-index'
  },
  {
    path: '/shop-management',
    name: 'shop-management',
    components: {
      default: ShopManagement
    },
    meta: {
      title: '商品管理'
    }
  },
  {
    path: '/shop-upload',
    name: 'shop-upload',
    components: {
      default: ShopUpload
    },
    meta: {
      title: '发布'
    }
  },
  {
    path: '/detail/:id',
    name: 'detail',
    components: {
      default: Detail
    },
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/history',
    name: 'history',
    components: {
      default: History
    },
    meta: {
      title: '我的足迹'
    }
  },
  {
    path: '/order-list',
    name: 'order-list',
    components: {
      default: OrderList
    },
    meta: {
      title: '我的订单'
    }
  },
  // {
  //   path: '/list',
  //   name: 'list',
  //   components: {
  //     default: List
  //   },
  //   meta: {
  //     title: '逛一逛'
  //   }
  // },
  {
    path: '/shop-index',
    name: 'index',
    components: {
      default: ShopIndex
    },
    meta: {
      title: '首页'
    }
  },

  {
    path: '/order-detail/:orderId',
    name: 'order-detail',
    components: {
      default: OrderDetail
    },
    meta: {
      title: '订单详情'
    }
  },
  {
    path: '/my-address',
    name: 'my-address',
    components: {
      default: MyAddress
    },
    meta: {
      title: '我的收货地址'
    }
  },
  {
    path: '/add-address',
    name: 'add-address',
    components: {
      default: AddAddress
    },
    meta: {
      title: '新增地址'
    }
  },
  {
    path: '/modify-address',
    name: 'modify-address',
    components: {
      default: ModifyAddress
    },
    meta: {
      title: '修改地址'
    }
  },
  {
    path: '/confirm-order',
    name: 'confirm-order',
    components: {
      default: ConfirmOrder
    },
    meta: {
      title: '确认订单'
    }
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    components: {
      default: Success
    },
    meta: {
      title: '确认订单'
    }
  },
  {
    path: '/message',
    name: 'message',
    components: {
      default: Message
    },
    meta: {
      title: '消息通知'
    }
  },{
    path: '/404'
  }
]

export default routes
