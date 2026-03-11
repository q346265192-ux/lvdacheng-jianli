export type WorkItem = {
  id: number;
  name: string;
  url: string;
  type: 'video';
};

export const WORKS_OSS_BASE = 'https://lvdacheng.oss-cn-beijing.aliyuncs.com/zuopin/zuopin';
export const worksOssUrl = (fileName: string) => `${WORKS_OSS_BASE}/${encodeURIComponent(fileName)}`;

export const WORKS: WorkItem[] = [
  { id: 100, name: '蓝月亮广告片-案例1', type: 'video', url: worksOssUrl('蓝月亮广告片-案例1.mp4') },
  { id: 99, name: '宝宝历险记', type: 'video', url: worksOssUrl('宝宝历险记.mp4') },
  { id: 98, name: '小鹏x9', type: 'video', url: worksOssUrl('小鹏x9.mp4') },
  { id: 97, name: '三只松鼠案例1', type: 'video', url: worksOssUrl('三只松鼠案例1.mp4') },
  { id: 96, name: '三只松鼠案例2', type: 'video', url: worksOssUrl('三只松鼠案例2.mp4') },
  { id: 95, name: '企业创意宣传', type: 'video', url: worksOssUrl('企业创意宣传.mp4') },
  { id: 94, name: '原生密码案例1', type: 'video', url: worksOssUrl('原生密码案例1.mp4') },
  { id: 93, name: '蓝月亮广告片-案例2', type: 'video', url: worksOssUrl('蓝月亮广告片-案例2.mp4') },
  { id: 92, name: '赵云角色宣传片', type: 'video', url: worksOssUrl('赵云角色宣传片.mp4') },
];

export const WORKS_VIDEO_URLS = WORKS.map((w) => w.url);
