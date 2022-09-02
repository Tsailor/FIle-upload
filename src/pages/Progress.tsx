import React from 'react';
import { Progress } from 'antd';
import { LoadingOutlined, LinkOutlined } from '@ant-design/icons';
import { ProgressType, ProgressComType } from '../index.d';
const colorMap = {
  fail: 'red',
  success: 'green',
  normal: 'black',
};
const FileProgress: React.FC<ProgressComType> = (props) => {
  const { className, title, loading, status, percent } = props;
  return (
    <div className={className} style={{ color: colorMap[status] }}>
      <div style={{ display: 'flex' }}>
        <span style={{ margin: '0 4px' }}> {loading ? <LoadingOutlined /> : <LinkOutlined />} </span> {title}
      </div>
      <Progress percent={percent} />
    </div>
  );
};
export default FileProgress;
