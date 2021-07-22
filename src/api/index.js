import request from './request';

// 登录
export const Login = (username, password) => request('/login/login', {username, password});

// 密码修改
export const changePwd = (username, oldPasswd, newPasswd) => request('/changePasswd', {username, oldPasswd, newPasswd});

// 根据栋数和层数筛选寝室
export const findAllDorm = (tung, layer) => request('/alldormnum', {tung, layer});

// 获取某个寝室历史查寝记录
export const findDormAllRecord = ({
  dormNum, 
  currentPage, 
  pageSize, 
  state='', 
  className=''}) => request('/getDetailedMsg', {dormNum, currentPage, pageSize,state, className});

// 老师/学生发送请求修改已读状态
export const changeRead = (queryObj) => request('/'+(queryObj.position ? 'changeRead' : 'changeStateStu'), {...queryObj});

// 根据状态搜索某个寝室的查寝记录
export const searchDormRecord = (state, dormNum,currentPage, pageSize) => request('/findDorm', {state, dormNum, currentPage, pageSize});

// 获取寝室成员
export const getDormNum = (dormNum) => request('/getDormNum', {dormNum});

// 根据id删除查寝记录
export const deleteCheckdorm = (checkdormId) => request('/deletecheckdorm', {checkdormId},  'DELETE');

// 点击提交增加一条查寝记录
export const insertCheckdorm = (
  tung,
  dormNum,
  checkTime,
  college,
  className,
  state,
  qualifiedDescribe,
  unqualifiedDescribe, 
  qualifiedPicture,
  unqualifiedPicture,
  checker) => request('/insertcheckdorm', {
    tung,
    dormNum,
    checkTime,
    college,
    className,
    state,
    qualifiedDescribe,
    unqualifiedDescribe, 
    qualifiedPicture,
    unqualifiedPicture,
    checker
  })

  // 获取学院所有班级
  export const findAllClass = ({college, position}) => request('/findBytime', {college, position});

  // 根据班级、合格状态来获取寝室列表
  export const getStateAndCount = ({college, className='', state=''}) => request('/getStateAndCount', {college, className, state});

  // 班主任角色的本班寝室列表
  export const teaCheckDorm = (username) => request('/teaCheckDorm', {username}, 'GET') 

  // 学生角色获取查寝记录
  export const stuGetRecord = (stunum, currentPage, pageSize) => request('/stuDorm', {stunum, currentPage, pageSize});

  // 提交反馈
  export const sendFeedback = (feedbackObj) => request('/sendfeedback', {...feedbackObj});
