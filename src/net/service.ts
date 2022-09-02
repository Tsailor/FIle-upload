import { AxiosResponse } from 'axios';
import { FileUploadInfo ,ResponseTemplate} from '../index.d';
import request from './request';

export const beforeUploadRequest = (fileUploadInfo: FileUploadInfo) => {
  return request('/attach/stream/segmentUpload.do?', {
    method: 'GET',
    // headers: {
    //   'Content-Type': 'x-www-form-urlencode',
    // },
    // responseType: 'blob',
    params: fileUploadInfo,
  });
};

export const uploadToMinIo = (url:string, file:Blob) => {
    return request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'binary',
      },
      // responseType: 'blob',
      data: file,
    });
  };
// 'data' 作为请求主体被发送的数据
// 适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
// 必须是以下类型之一：
// - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
// - 浏览器专属：FormData, File, Blob
// - Node 专属： Stream

export const mergeUploadFile = (filename:string, uploadid:string, etag:string) => {
  return request("/attach/stream/mergePart.do", {
    method: 'get',
    headers: {
      // 'Content-Type': 'binary',
    },
    // responseType: 'blob',
    params:{
      filename, uploadid, etag
    }
  });
};