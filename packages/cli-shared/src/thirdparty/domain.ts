import axios from 'axios';
import os from 'os';

function getLocalIP(): string {
  let distance = 999999;
  const ipList = [];
  let result;

  /**
   * 找到所有interfaces
   */
  const ifaces = os.networkInterfaces();
  for (const i in ifaces) {
    if (ifaces.hasOwnProperty(i)) {
      const ips = ifaces[i];
      while (ips.length) {
        const ip = ips.pop();
        if (ip.family === 'IPv4' && ip.address !== '127.0.0.1') {
          /**
           * ipv4 中不是 127 的
           */
          ipList.push(ip.address);
        }
      }
    }
  }

  /**
   * 离10.x网段最近的ip
   */
  ipList.forEach(ip => {
    const ipPrefix = parseInt(ip, 10);
    if (ipPrefix - 10 < distance) {
      result = ip;
      distance = ipPrefix - 10;
    }
  });

  return result;
}

export async function getHpmDomain(): Promise<string> {
  // 只有开启domain才会生成

  // const interfaces = os.networkInterfaces();
  // // 家里vpn，访问不了这个域名，deprecated
  // const utun0 = interfaces && interfaces.utun0 || [];
  // // 公司局域网
  // const en0 = interfaces && interfaces.en0 || [];

  // 如果存在 en0 网卡, 且有 IPv4地址
  const ipv4address = getLocalIP();

  if (ipv4address) {
    try {
      const resp = await axios({
        method: 'get',
        timeout: 10000,
        url: `http://nodejs.inc.alipay.net:4567/getDomain?ip=${ipv4address}&type=alipay`,
      });

      if (resp.status + '' === '200') {
        if (resp.data.domain) {
          return resp.data.domain;
        } else {
          throw new Error('not getting domain from response data');
        }
      } else {
        throw new Error('network status wrong');
      }
    } catch (ex) {
      throw ex;
    }
  } else {
    throw new Error('did not get ipv4 from os');
  }
}
