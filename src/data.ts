import type {Task} from './types';export const initialTasks:Task[]=[
{id:'1',title:'东区快递代取',description:'帮我从东区菜鸟驿站取一个中小件，放到图书馆一楼。',category:'快递',location:'东区菜鸟驿站',destination:'图书馆一楼',reward:5,deadline:'18:30',distance:.18,status:'open',publisher:'林同学',credit:98,tags:['顺路','5分钟']},
{id:'2',title:'帮买一杯冰美式',description:'无糖少冰，送到教学楼 A 座。',category:'代买',location:'南门咖啡店',destination:'教学楼 A 座',reward:8,deadline:'17:40',distance:.42,status:'open',publisher:'Momo',credit:96,tags:['顺路','高奖励']},
{id:'3',title:'图书馆帮占一个座',description:'三楼靠窗区域，18:00 前帮忙占座。',category:'占座',location:'图书馆三楼',destination:'图书馆三楼',reward:3,deadline:'18:00',distance:.31,status:'open',publisher:'小周',credit:94,tags:['附近','低耗时']},
{id:'4',title:'打印课程资料',description:'《软件工程》资料 18 页，黑白双面。',category:'资料',location:'综合楼打印店',destination:'宿舍区 7 栋',reward:6,deadline:'19:10',distance:.68,status:'open',publisher:'阿杰',credit:97,tags:['新任务']},
{id:'5',title:'帮拿社团材料',description:'顺路从社团活动室拿资料到体育馆。',category:'其他',location:'社团活动室',destination:'体育馆',reward:7,deadline:'20:00',distance:.51,status:'open',publisher:'小雨',credit:99,tags:['顺路','信用达人']}
];