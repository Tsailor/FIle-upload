import { RcFile } from 'rc-upload/lib/interface';
import SparkMD5 from 'spark-md5';
import { uploadToMinIo } from '../net/service';
import { ProgressParamsType, ComputePartReturns } from '../index.d';

type computeMD5Return = {
  md5: string;
  chunkCache: Blob[];
};

//计算MD5
export const computeMD5 = (file: RcFile, chunkSize: number): Promise<computeMD5Return> => {
  return new Promise<computeMD5Return>((resolve, reject) => {
    let blobSlice = File.prototype.slice,
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();

    let chunkCache: Blob[] = []; // 缓存分片
    let time = new Date().getTime();

    fileReader.onload = (e) => {
      const { result } = e.target as FileReader;
      spark.append(result as ArrayBuffer); // Append array buffer

      console.log(`第${currentChunk}分片解析完成, 开始第${currentChunk + 1} / ${chunks}分片解析`);
      currentChunk++;

      if (currentChunk < chunks) {

        loadNext();
      } else {
        console.log('finished loading');
        let md5 = spark.end(); //得到md5
        console.log(`MD5计算完成：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`);
        spark.destroy(); //释放缓存

        resolve({ md5, chunkCache });
      }
    };

    fileReader.onerror = () => {
      console.warn('oops, something went wrong.');
      reject();
    };

    const loadNext = () => {
      let start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize;

     let  chunckItem = blobSlice.call(file, start, end);
    
      
      chunkCache.push(chunckItem);
      fileReader.readAsArrayBuffer(chunckItem);
    };

    loadNext();
  });
};

// export const requsetBuilder = <T>(urls: string[], datas: T[], uploadToMinIo: (url: string, data: T) => Promise<any>) => {
//   let requestList = urls.map((url, index) => {
//     let p = () => uploadToMinIo(url, datas[index]);
//     return p;
//   });
//   return requestList;
// };

export const sendRequest = (
  file:RcFile,
  uploadUrls: string[],
  chunkCache: Blob[],
  max = 6,
  callback: () => Promise<any>,
  //   onSuccess?: () => void,
  onProgress: (params: ProgressParamsType) => void,
) => {
  let i = 0; // 数组下标
  let okCount = 0;
  let fetchArr: Promise<any>[] = []; // 正在执行的请求
  let len = uploadUrls.length;
  let toFetch = (): Promise<any> => {
    // 如果异步任务都已开始执行，剩最后一组，则结束并发控制
    if (i === len) {
      return Promise.resolve();
    }
    onProgress({ title: `正在开始上传 - ${file.name}` });
    // 执行异步任务
    let it = uploadToMinIo(uploadUrls[i], chunkCache[i]);
    i++;
    // 添加异步事件的完成处理
    it.then(() => {
      console.log("resolve");
      okCount++;
      fetchArr.splice(fetchArr.indexOf(it), 1);
      const precentStr = ((okCount / len) * 100 - 1).toFixed(2);
      onProgress({title: `正在上传 - ${file.name}`, percent: Number(precentStr) });
      //   onProgress && onProgress({ precent: ((i / len) * 100).toFixed(2) });
    }).catch((err) => {
      console.log("error",err);
      return Promise.reject(err);
    });
    fetchArr.push(it);

    let p = Promise.resolve();
    // 如果并发数达到最大数，则等其中一个异步任务完成再添加
    if (fetchArr.length >= max) {
      p = Promise.race(fetchArr);
    }

    // 执行递归
    return p.then(() => toFetch());
  };

  toFetch().then(() =>
    // 最后一组全部执行完再执行回调函数
    Promise.all(fetchArr).then(() => {
      onProgress({ title: `即将上传完成 - ${file.name}` });
      callback();
    }),
  ).catch(()=>{
    onProgress({ percent: 0,status:"fail",loading:false ,title: `上传失败- ${file.name}` });
  });
};

// const FILE_PER_SIZE = 10 * 1024 * 1024;
// const Max_File_SIZE = 1000 * 10 * 1024 * 1024;
// const Min_File_SIZE = 5 * 1024 * 1024;

export const computePart = (size: number): ComputePartReturns => {
//   const Max_File_SIZE = 1000 * 10 * 1024 * 1024;
  const Min_File_SIZE = 6 * 1024 * 1024;
  if (size < Min_File_SIZE) {
    return { partCount: 1, partSize: Min_File_SIZE };
  } else if (size < 1000 * Min_File_SIZE) {
    const partCount = Math.ceil(size / Min_File_SIZE);
    return { partCount, partSize: Min_File_SIZE };
  } else {
    const partSize = Math.ceil(size / 1000);
    return {
      partCount: 1000,
      partSize,
    };
  }
};
