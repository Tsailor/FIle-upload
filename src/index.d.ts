export declare type BeforeUploadValueType = void | boolean | string | Blob | File;

export declare type FileInfo = {
  lastModified: number;
  name: string;
  size: number;
  type: string;
};

export declare type FileUploadInfo = {
  partCount: number;
  etag: string;
  filename: string;
};

export declare type SegmentDetail = {
  isExist: boolean;
  partCount: number;
  partNumber: number[];
  uploadId: string;
  uploadUrls: string[];
};

export declare type ResponseTemplate = {
  code: number;
  data: SegmentDetail;
};
type StatusType = 'fail' | 'success' | 'normal';

export declare type ProgressParamsType = {
  title?: string;
  loading?: boolean;
  status?: StatusType;
  percent?: number;
};
export declare type ProgressType = {
    title: string;
    loading: boolean;
    status: StatusType;
    percent: number;
  };
export declare type ProgressComType = ProgressType & {
  className?: string;
};

export declare type ComputePartReturns = {
    partCount:number;
    partSize:number;
}