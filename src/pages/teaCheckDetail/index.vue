<template>
  <view class="container">
    <view class="title">
      <text>寝室:{{ dormNum }}</text>
    </view>
    <view class="content">
      <!-- 查寝记录 -->
      <view class="checkInfo">
        <view class="checker">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>查寝用户:</text
          ><text class="role">{{ teaDormInfo.checker }}</text>
        </view>
        <view class="checkedTime">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>查寝时间:</text>
          <text class="time">{{ teaDormInfo.checkTime }}</text>
        </view>
        <view class="className">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>寝室班级:</text>
          <text class="class">{{ teaDormInfo.className }}</text>
        </view>
        <view class="dormNumber">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <view>寝室成员:</view>
          <text v-for="item in dormNumber" :key="item.id">{{ item.name }}</text>
        </view>
        <view class="state_wrap">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>合格状态:</text>
          <text class="state">{{ teaDormInfo.state }}</text>
        </view>
        <view class="des_content">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>查寝描述:</text>
          <view v-if="checkedDes">{{ checkedDes }}</view>
          <view v-else>无</view>
        </view>
        <view class="checked_pic">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>查寝照片:</text>
          <view class="pic_content">
            <block v-if="urlList.length">
              <view
                class="checkedImg_item"
                v-for="(item, index) in urlList"
                :key="index"
                :data-path="index"
                @click="PreviewCheckedImg"
              >
                <image :src="item" />
              </view>
            </block>
          </view>
        </view>
      </view>
      <view class="feedbackInfo">
        <view class="fb_content">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>反馈描述:</text>
          <view v-if="feedbackDes">{{ feedbackDes }}</view>
          <view v-else>无</view>
        </view>
        <view class="fb_pic">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>反馈照片:</text>
          <view class="pic_content">
            <block v-if="feedbackUrl.length">
              <view
                class="checkedImg_item"
                v-for="(item, index) in feedbackUrl"
                :key="index"
                :data-path="index"
                @click="PreviewFeedbackImg"
              >
                <image :src="item" />
              </view>
            </block>
          </view>
        </view>
      </view>
    </view>
    <view class="btn_wrap">
      <button type="default" @click="deleteCheck">删除记录</button>
      <button type="primary" @click="addCheck">新增走访</button>
    </view>
  </view>
</template>

<script>
import { getDormNum, deleteCheckdorm } from "../../api/index";
export default {
  data() {
    return {
      teaDormInfo: {}, //查寝信息对象
      urlList: [], //图片数组
      dormNum: "", //寝室号
      dormNumber: [], //寝室成员
      checkedDes: "", //查寝描述
      feedbackDes: "", //反馈描述
      feedbackUrl: [] //反馈图片
    };
  },
  onShow() {
    this.getCheckedInfo();
    setTimeout(() => {
      this.getDormNumber();
    }, 100);
  },
  methods: {
    // 获取本地存储的信息对象
    getCheckedInfo() {
      this.teaDormInfo = uni.getStorageSync("teaDormInfo");
      // 获取寝室号
      this.dormNum = this.teaDormInfo.dormNum;
      // 获取查寝描述
      this.checkedDes =
        this.teaDormInfo.qualifiedDescribe ||
        this.teaDormInfo.unqualifiedDescribe;
      // 分割图片路径字符串
      let url =
        this.teaDormInfo.qualifiedPicture ||
        this.teaDormInfo.unqualifiedPicture;
      if (!(url == "null" || url == "")) {
        this.urlList = url.split(",");
      }
      // 反馈描述
      this.feedbackDes = this.teaDormInfo.feedbackDescribe;
      // 分割反馈图片字符串
      let pic = this.teaDormInfo.feedbackPicture;
      if (!(pic == "null" || pic == "" || pic == null)) {
        this.feedbackUrl = pic.split(",");
      }
    },
    // 获取寝室成员
    async getDormNumber() {
      const result = await getDormNum(this.dormNum);
      if (result.data.code == 200) {
        this.dormNumber = result.data.data3;
      } else {
        uni.showToast({
          title: "获取寝室成员失败~",
          icon: "none"
        });
      }
    },
    // 新增评价
    addCheck() {
      let { college, tung, dormNum, className } = this.teaDormInfo;
      const checker = uni.getStorageSync("checker");
      wx.navigateTo({
        url: "/pages/checkform/index",
        success: res => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("acceptDataFromOpenerPage", {
            college,
            tung,
            dormnum: dormNum,
            className,
            checker
          });
        }
      });
    },
    // 删除本条记录
    deleteCheck() {
      uni.showModal({
        content: "确定删除该记录吗?",
        success: async res => {
          if (res.confirm) {
            const result = await deleteCheckdorm(this.teaDormInfo.id);
            if (result.data.code === 200) {
              uni.showToast({
                title: "删除成功",
                icon: "success"
              });
              //删除成功后返回上一页
              setTimeout(() => {
                uni.navigateBack();
              }, 300);
            } else {
              uni.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          } else if (res.cancel) {
            return;
          }
        }
      });
    },
    //点击查寝图片预览大图
    PreviewCheckedImg(event) {
      const _this = this;
      let { url } = event.currentTarget.dataset;
      uni.previewImage({
        current: url, // 当前显示图片的http链接
        urls: _this.urlList // 需要预览的图片http链接列表
      });
    },
    //点击查寝图片预览大图
    PreviewFeedbackImg(event) {
      const _this = this;
      let { url } = event.currentTarget.dataset;
      uni.previewImage({
        current: url, // 当前显示图片的http链接
        urls: _this.feedbackUrl // 需要预览的图片http链接列表
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #eee;
  .title {
    height: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  .content {
    flex: 5;
    display: flex;
    flex-direction: column;
    padding: 0 10rpx;
    .checkInfo {
      flex: 3;
      display: flex;
      flex-direction: column;
      margin: 10rpx 0;
      background-color: #fff;
      border-radius: 6rpx;
      .checker {
        flex: 1;
        display: flex;
        align-items: center;
        .role {
          margin-left: 10rpx;
        }
      }
      .checkedTime {
        flex: 1;
        display: flex;
        align-items: center;
        .time {
          margin-left: 10rpx;
        }
      }
      .className {
        flex: 1;
        display: flex;
        align-items: center;
        .class {
          margin-left: 10rpx;
        }
      }
      .dormNumber {
        flex: 1;
        display: flex;
        align-items: center;
        text {
          margin-left: 10rpx;
        }
      }
      .state_wrap {
        flex: 1;
        display: flex;
        align-items: center;
        .state {
          margin-left: 10rpx;
        }
      }
      .des_content {
        flex: 2;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        view {
          margin-left: 10rpx;
          width: 75%;
          font-size: 30rpx;
        }
      }
      .checked_pic {
        flex: 3;
        display: flex;
        align-items: center;
        .pic_content {
          width: 75%;
          height: 150rpx;
          border: 1rpx solid #ccc;
          margin-left: 10rpx;
          border-radius: 10rpx;
          display: flex;
          align-items: center;
          margin-left: 10rpx;
          .checkedImg_item {
            width: 120rpx;
            height: 120rpx;
            margin-left: 40rpx;
            image {
              width: 100%;
              height: 100%;
              border-radius: 15rpx;
            }
          }
        }
      }
    }
    .feedbackInfo {
      flex: 2;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-radius: 6rpx;
      .fb_content {
        flex: 2;
        margin-top: 40rpx;
        display: flex;
        align-items: center;
        border-radius: 10rpx;
        view {
          margin-left: 10rpx;
          width: 75%;
          font-size: 30rpx;
        }
      }
      .fb_pic {
        flex: 3;
        display: flex;
        align-items: center;
        .pic_content {
          width: 75%;
          height: 150rpx;
          border: 1rpx solid #ccc;
          margin-left: 10rpx;
          border-radius: 10rpx;
          display: flex;
          align-items: center;
          margin-left: 10rpx;
          .checkedImg_item {
            width: 120rpx;
            height: 120rpx;
            margin-left: 40rpx;
            image {
              width: 100%;
              height: 100%;
              border-radius: 15rpx;
            }
          }
        }
      }
    }
  }
  .btn_wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: #fff;
    margin-top: 10rpx;
    button {
      padding: 0;
      margin: 0;
      width: 45%;
      font-size: 32rpx;
    }
  }
}
</style>