<template>
  <view class="container">
    <!-- <uni-search-bar
      class="uniSearch"
      :radius="100"
      :maxlength="10"
      clearButton="none"
      placeholder="请输入已读/未读搜索"
      @input="handleInput"
      @confirm="handleSearch"
      @cancel="handleCancel"
    ></uni-search-bar> -->
    <view class="title">
      <view class="dormnum"><text>{{dormnum}}</text></view>
      <view class="btn"><button type="primary" @click="addCheck">新增走访</button></view>
    </view>
    <view class="scroll_title">
      <!-- <text>查寝日期</text>
      <text>是否合格</text>
      <text>是否已读</text> -->
      <uni-tag text="查寝时间" type="primary" :inverted="true"></uni-tag>
      <uni-tag text="合格状态" type="primary" :inverted="true"></uni-tag>
      <uni-tag text="是否已读" type="primary" :inverted="true"></uni-tag>
    </view>
    <scroll-view class="sroll_content" scroll-y>
      <view
        class="sroll_item"
        hover-class="Active"
        @click="handleToRecord"
        :data-id="item.id"
        v-for="(item, index) in insDormInfo"
        :key="index"
      >
        <view class="item_time">
          <!-- <uni-tag :text="item.checkTime" type="primary"></uni-tag> -->
          <view class="checkTime">{{item.checkTime}}</view>
        </view>
        <view class="item">
          <uni-tag
            v-if="item.state == '优秀'"
            text="优秀"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '良好'"
            text="良好"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '一般'"
            text="一般"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '较差'"
            text="较差"
            type="warning"
          ></uni-tag>
          <uni-tag v-else text="脏乱差" type="error"></uni-tag>
        </view>
        <view class="item">
          <uni-tag
            v-if="item.fdyReadIt == 'read'"
            text="已读"
            type="default"
          ></uni-tag>
          <uni-tag v-else text="未读" type="warning"></uni-tag>
        </view>
      </view>
    </scroll-view>
    <view class="pagination">
      <uni-pagination  show-icon="true" :total="total" :pageSize="pageSize" :current="currentPage" @change="handlePageChange"></uni-pagination>
    </view>
  </view>
</template>

<script>
import uniSearchBar from "@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.vue";
import uniTag from "@dcloudio/uni-ui/lib/uni-tag/uni-tag.vue";
import uniPagination from "@dcloudio/uni-ui/lib/uni-pagination/uni-pagination.vue";
import { findDormAllRecord, changeRead } from "../../api/index";

export default {
  components: {
    uniSearchBar,
    uniTag,
    uniPagination
  },
  data() {
    return {
      insDormInfo: [], //辅导员账号时间截取后寝室查寝记录数组
      checkTime: "",
      dormnum: "",
      className: "",
      tung:'',
      college:'',
      state: "",
      dateList: [], //查寝日期数组
      queryObj: {}, //修改已读状态所需的参数
      value: "", //搜索框输入内容
      currentPage: 1, //为当前页
      pageSize: 15,
      total:0,
    };
  },
  //监听页面加载
  onLoad(options) {
    this.dormnum = options.dormnum;
    this.college = options.college;
    this.className = options.className;
    this.tung = options.tung;
  },
  onShow() {
    this.insGetchecklist();
  },
  methods: {
    //辅导员账号获取单个寝室历史查寝记录
    async insGetchecklist() {
      const result = await findDormAllRecord({dormNum:this.dormnum, currentPage:this.currentPage, pageSize:this.pageSize});
      this.insDormInfo = result.data.data2;
      this.total = result.data.data;
    },
    // 新增评价
    addCheck() {
      uni.navigateTo({
        url: "/pages/checkform/index",
        success: (res)=> {
          // 通过eventChannel向被打开页面传送数据
          const checker = uni.getStorageSync('checker');
          res.eventChannel.emit("acceptDataFromOpenerPage", {
            college: this.college,
            tung:this.tung,
            dormnum:this.dormnum,
            className:this.className,
            checker
          });
        }
      });
    },
    //监听搜索框的输入
    /* handleInput(e) {
      const val = e.value.trim();
      if(val == '已读'){
        this.value = 'read'
      }else if (val == '未读') {
        this.value = 'unread'
      }
    }, */
    //回车确认搜索
    /* async handleSearch(e) {
      if (this.value == "read" || this.value == "unread") {
        let res = await ("/findBytime", {
          state: '',
          className: this.className,
          position: "",
          college: "",
          isread: this.value,
          check_time: "",
          currentPage: "",
          pageSize: ""
        });
        this.insDormInfo = res.data.data2;
      } else {
        uni.showToast({
          title: "输入不合法",
          icon: "none"
        });
      }
    }, */
    //点击取消
    /* async handleCancel() {
      this.insGetchecklist();
    }, */
    // 点击寝室号跳转到查寝记录详情
    async handleToRecord(e) {
      const id = e.currentTarget.dataset.id;
      // 获得并截取查寝角色 
      const checker = uni.getStorageSync("checker");
      const index = checker.lastIndexOf("_");
      const position = checker.substring(index + 1, checker.length);
      this.insDormInfo.some(item => {
        if (item.id == id) {
          this.queryObj = item;
        }
      });
      delete this.queryObj.version;
      // 发送请求修改已读状态
      await changeRead({ ...this.queryObj, position });
      // 将点击的对应查寝对象保存到本地
      uni.setStorageSync('insDormInfo', this.queryObj);
      uni.navigateTo({
        url: `/pages/insCheckDetail/index`
      });
    },
    //点击页码按钮时触发
    handlePageChange(e) {
      this.currentPage = e.current;
      this.insGetchecklist();
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  // .uniSearch {
  //   width: 100%;
  //   height: 80rpx;
  // }
  .title{
    display: flex;
    height: 100rpx;
    .dormnum{
      flex: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      text{
        width: 80%;
        line-height: 70rpx;
        padding: 0 10rpx;
        text-align: center;
        background-color: #007AFF;
        color: #fff;
        border-radius: 10rpx;
        font-size: 30rpx;
      }
    }
    .btn{
      flex: 6;
      display: flex;
      align-items: center;
      button{
        width: 90%;
        line-height: 70rpx;
        font-size: 30rpx;
      }
    }
  }
  .scroll_title {
    height: 100rpx;
    width: 100%;
    padding-bottom: 20rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 1rpx solid #666;
  }
  .sroll_content {
    flex: 1;
    height: calc(100vh - 130px);
    .sroll_item {
      height: 94rpx;
      width: 100%;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;
      .item_time{
        flex: 1;
        font-size: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        .checkTime{
          text-align: center;
          color: #fff;
          line-height: 70rpx;
          background-color: #007AFF;
          border-radius: 6rpx;
        }
      }
      .item{
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .pagination {
    background-color: #f8f8f8;
  }
}
</style>
