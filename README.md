# GameNodeTry

- Action 行为处理
- BASE 用户交互界面-命令行
- UI 进行图像分析和识别
- Source 加载所需的资源
- Main 主逻辑
- constants 系统常量
- Worker 进程管理

## 状态机

1. move 移动
2. attack 攻击
3. pickup 捡起装备
4. back 回城
5. find monster 找怪物
6. find target 寻路
7. find map 地图判断

## 流程
- 下地图: 7 -> 6 -> 1 -> ui点击 
- 回收: 操作 -> 7 -> 6 -> 1 -> ui点击
- 捡装备: 6 -> 1 
- 打怪: 5 -> 1 -> 2 -> 捡装备
- 挂机: 7 -> 6 -> 1 -> 6 -> 打怪 -> 4  
- 自动挂机:下地图-> 挂机-> 回收

## feature

1. 指定路线
2. 单狗抓