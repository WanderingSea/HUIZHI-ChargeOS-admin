import request from '@/utils/request'

export function faultReport(data) {
  return request({
    url: '/operator/charge/faultReport',
    method: 'post',
    data: data
  })
}

export function faultReset(data) {
  return request({
    url: '/operator/charge/faultReset',
    method: 'post',
    data: data
  })
}

export function startupComplete(data) {
  return request({
    url: '/operator/charge/startupComplete',
    method: 'post',
    data: data
  })
}

export function vinAuth(data) {
  return request({
    url: '/operator/charge/vinAuth',
    method: 'post',
    data: data
  })
}

export function powerControl(data) {
  return request({
    url: '/operator/charge/powerControl',
    method: 'post',
    data: data
  })
}

export function rateDetailSync(priceId, data) {
  return request({
    url: '/operator/charge/rateDetailSync',
    method: 'post',
    params: { priceId: priceId },
    data: data
  })
}

export function orderRateDetail(data) {
  return request({
    url: '/operator/charge/orderRateDetail',
    method: 'post',
    data: data
  })
}

export function hourlyEnergy(orderId, data) {
  return request({
    url: '/operator/charge/hourlyEnergy',
    method: 'post',
    params: { orderId: orderId },
    data: data
  })
}

export function v2OrderSettlement(data) {
  return request({
    url: '/operator/charge/V2OrderSettlement',
    method: 'post',
    params: data
  })
}