import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { DraggerProps } from 'antd/lib/upload/Dragger';

import { UploadRequestOption, RcFile } from 'rc-upload/lib/interface';
import styles from './index.less';
import { BeforeUploadValueType, SegmentDetail, ProgressType, ProgressParamsType } from '../index.d';
import { computeMD5, sendRequest, computePart } from './utils';
import { beforeUploadRequest, uploadToMinIo, mergeUploadFile } from '../net/service';
import { useState } from 'react';
import FileProgress from './Progress';
import { useEffect } from 'react';
import { useSyncCallback } from "./hooks";
const { Dragger } = Upload;

const Max_File_SIZE = 1000 * 10 * 1024 * 1024; // 预设最大值
const Min_File_SIZE = 6 * 1024 * 1024; // minIo限制切片 min = 5MB  max=5GB

const IndexPage: React.FC<{}> = () => {
  const initProgress: ProgressType = {
    title: '正在解析',
    loading: true,
    status: 'normal',
    percent: 0,
  };
  //上传操作 选择的文件
  const [uploadFile, setUploadFile] = useState<RcFile>();
  // 文件切片上传 信息 (通知切片接口返回的内容)
  const [segmentDetail, setSegmentDetail] = useState<SegmentDetail | null>(null);
  // 缓存切片
  const [chunkCache, setChunkCache] = useState<Blob[]>([]);
  // 计算的MD5
  const [md5, setMd5Cache] = useState<string>();
  // 文件上传 进度条参数
  const [progressParams, setProgressParams] = useState<ProgressType>(initProgress);
  // 是否展示进度条
  const [isShow, setShowProgress] = useState<boolean>(false);

  // // 拿到切片接口返回数据后,则开始上传
  // useEffect(() => {
  //   if (segmentDetail) {
  //     handleUpload();
  //   }
  // }, [segmentDetail]);

  const handleProgress = (params: ProgressParamsType): void => {
    
    
    // console.log("_progressParams",_progressParams)
    setProgressParams(preProgress =>({
      ...preProgress,
      ...params,
    }));
  };
  const mergeRequest = (): Promise<any> => {
    console.log('通知合并');
    const { uploadId } = segmentDetail as SegmentDetail;
    const { name } = uploadFile as RcFile;
    return mergeUploadFile(name, uploadId, md5 as string).then((res) => {
      console.log('合并', res);
      const { code } = res as any;
      if (code === 0) {
        message.success('上传成功');
        handleProgress({ percent: 100, status: 'success', loading: false ,title: `上传完成 - ${name}` });
      } else {
        message.error('上传失败');
        handleProgress({ status: 'fail', loading: false ,title: `上传失败 - ${name}`});
      }
    });
  };

  const handleUpload = () => {
    const { isExist, partCount, uploadId, uploadUrls, partNumber } = segmentDetail as SegmentDetail;
    if (isExist && !uploadUrls.length) {
      // 秒传
      mergeRequest();
    } else if (isExist && uploadUrls.length) {
      // 续传
      // 从 chunkCache 过滤已传的
      const _chunkCache = chunkCache.filter((item, index) => partNumber.includes(index + 1));

      sendRequest(uploadFile as RcFile,uploadUrls, _chunkCache, 4, mergeRequest, handleProgress);
    } else {
      sendRequest(uploadFile as RcFile,uploadUrls, chunkCache, 4, mergeRequest, handleProgress);
    }
  };
  
  const handleUploadSync = useSyncCallback(handleUpload);

  const beforeUpload = async (file: RcFile, fileList: RcFile[]): Promise<BeforeUploadValueType> => {
    console.log('beforeUpload -file ', file);
    const { name, size } = file;
    setSegmentDetail(null);
    if (size > Max_File_SIZE) {
      message.error('此文件超过限制, 只能上传小于 10GB 的文件');
      return Upload.LIST_IGNORE;
    }
    // const partCount = Math.ceil(size / FILE_PER_SIZE);
    setUploadFile(file); // 保存选择的文件
    const { partCount, partSize } = computePart(size);
    console.log(`分片数量:${partCount}--每片大小${partSize}`);
    try {
      handleProgress(initProgress);
      setShowProgress(true);

      const { md5, chunkCache } = await computeMD5(file, partSize);
      setChunkCache(chunkCache);
      setMd5Cache(md5);
      if (size < Min_File_SIZE) {
        // 特殊上传处理

        return Upload.LIST_IGNORE;
      }
      const fileUploadInfo = { filename: name, etag: md5, partCount };
      handleProgress({...initProgress, title: "正在准备上传"  });
      const result = await beforeUploadRequest(fileUploadInfo);
      console.log('result', result);
      const { data, code } = result as any;
      if (data && code === 0) {
        let percent = 0;
        const { isExist, partCount:_partCount, partNumber, uploadId, uploadUrls } = data;
        if (isExist) {
          const len = uploadUrls.length;
          percent = Number (  ( ( _partCount-len ) / _partCount * 100 ).toFixed(2) )
        }
        handleProgress({ title: name ,percent });
        setSegmentDetail(data);
        // 处理进度

        // 开始上传
        // handleUpload()   这样有bug,可以通过useEffect实现 
        handleUploadSync()
        
      }
      return Upload.LIST_IGNORE;
    } catch (err) {
      console.log(err);
      message.error(err);
      return Upload.LIST_IGNORE;
    }
  };
  const props: DraggerProps = {
    name: 'file',
    multiple: false,
    // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    // customRequest:,
    beforeUpload,
  };

  return (
    <div className={styles.container}>
      <div className={styles.dragger}>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
        </Dragger>
        {isShow ? <FileProgress {...progressParams} className="" /> : null}
      </div>
    </div>
  );
};
export default IndexPage;

// const FileProgress: React.FC<Props> = (props) => {
//   const { className, title, loading, status ,percent} = props;
