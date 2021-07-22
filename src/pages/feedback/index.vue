<template>
  <view class="container">
    <view class="title">
      <text>寝室:{{ checkedInfo.dormNum }}</text>
    </view>
    <view class="content">
      <!-- 查寝记录 -->
      <view class="checkInfo">
        <view class="checker">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>走访人员:</text
          ><text class="role">{{ checkedInfo.checker }}</text>
        </view>
        <view class="checkedTime">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>走访时间:</text>
          <text class="time">{{ checkedInfo.checkTime }}</text>
        </view>
        <view class="state_wrap">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>合格状态:</text>
          <text class="state">{{ checkedInfo.state }}</text>
        </view>
        <view class="des_content">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>走访描述:</text>
          <view v-if="checkedDes">{{ checkedDes }}</view>
          <view v-else>无</view>
        </view>
        <view class="checked_pic">
          <icon type="success_no_circle" size="10" color="#ccc" />
          <text>走访照片:</text>
            <view class="pic_content">
              <block v-if="urlList.length">
                <view
                  class="checkedImg_item"
                  v-for="(item, index) in urlList"
                  :key="index"
                  :data-path="index"
                  @click="PreviewCheckedImg"
                >
                  <image  :src="item" />
                </view>
              </block>
            </view>
        </view>
      </view>
      <!-- 反馈信息 -->
      <view class="feedbackInfo">
        <view class="fb_title">
          <text class="icon">*</text>
          反馈描述:
        </view>
        <view class="des_content">
          <textarea
            :maxlength="50"
            placeholder="请输入..."
            v-model="value"
          ></textarea>
        </view>
        <view class="fb_title">
          <text class="icon">*</text>
          反馈照片:
          <icon type="info" color="gray" size="12" />
          <text class="tip">点击可预览图片,长按可选择删除</text>
        </view>
        <view class="fb_imges">
          <button @click="handleAddImg">+</button>
          <view
            class="img_wrap"
            v-for="(item, index) in chooseImgs"
            :key="item"
            :data-path="index"
            @click="handlePreviewImg"
            @longpress="longpressImg"
          >
            <upload-imgs v-if="uploadImgs.length" :src="item"></upload-imgs>
          </view>
        </view>
      </view>
      <view class="btn_wrap">
        <button type="primary" @click="commit">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
import uniCard from "@dcloudio/uni-ui/lib/uni-card/uni-card.vue";
import UploadImgs from "../../components/UploadImgs/UploadImgs";
import { sendFeedback } from '../../api/index'
export default {
  components: {
    uniCard,
    UploadImgs,
  },
  data() {
    return {
      username: "", //学生登录账号
      checkedInfo: {}, //当天查寝信息
      checkedDes: "", //查寝描述
      urlList: [], //查寝照片
      value: "", //反馈描述
      chooseImgs: [],
      uploadImgs: [],
      isUploading: 0, //图片上传状态 0 初始， 1 上传成功， 2 上传失败
    };
  },
  //监听页面加载
  onShow() {
    this.getCheckedInfo();
  },
  methods: {
    // 获取本地存储的信息对象
    getCheckedInfo() {
      this.checkedInfo = uni.getStorageSync('checkedInfo');
      // 获取查寝描述
      this.checkedDes = this.checkedInfo.qualifiedDescribe || this.checkedInfo.unqualifiedDescribe;
      // 分割图片路径字符串
      let url = this.checkedInfo.qualifiedPicture || this.checkedInfo.unqualifiedPicture;
      if (!( url == 'null' || url == "")) {
        this.urlList = url.split(",");
      }
    },
    //点击查寝图片预览大图
    PreviewCheckedImg(event) {
      const _this = this;
      let { url } = event.currentTarget.dataset;
      uni.previewImage({
        current: url, // 当前显示图片的http链接
        urls: _this.urlList, // 需要预览的图片http链接列表
      });
    },
    //点击添加并上传图片
    handleAddImg() {
      if (this.uploadImgs.length > 2) {
        uni.showToast({
          title: "最多上传3张图片哦~",
          icon: "none",
          mask: true,
        });
        return;
      }
      uni.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          //获取本地存储的cookie
          let JSESSIONID = uni
            .getStorageSync("JSESSIONID")
            .split(";")[0]
            .split("=")[1];
          let cookie = "JSESSIONID=" + JSESSIONID;
          // tempFilePath可以作为img标签的src属性显示图片
          this.chooseImgs = [...this.chooseImgs, ...res.tempFilePaths];
          //上传图片
          const tempFilePaths = res.tempFilePaths;
          uni.uploadFile({
            url: "https://cxcy.gmu.cn/score/tupian",
            filePath: tempFilePaths[tempFilePaths.length - 1],
            name: "file",
            header: {
              "content-type": "multipart/form-data",
              cookie: cookie,
            },
            success: (res) => {
              const result = JSON.parse(res.data);
              if(result.code == 200){
                let url = result.data;
                this.uploadImgs.push(url);
              } else {
                uni.showToast({
                  title: '图片上传失败',
                  icon: 'none'
                })
              }
            },
          });
        },
      });
    },
    //点击上传的图片预览大图
    handlePreviewImg(event) {
      console.log(event);
      const _this = this;
      let { path } = event.currentTarget.dataset;
      uni.previewImage({
        current: path, // 当前显示图片的http链接
        urls: _this.uploadImgs, // 需要预览的图片http链接列表
      });
    },
    //长按图片选择是否删除
    longpressImg(event) {
      const _this = this;
      //获取当前点击图片下标
      let { index } = event.currentTarget.dataset;
      uni.showModal({
        title: "提示",
        content: "确认要删除该图片吗?",
        success: (res) => {
          if (res.confirm) {
            this.chooseImgs.splice(index, 1);
            this.uploadImgs.splice(index, 1);
          } else if (res.cancel) {
            return false;
          }
        },
      });
    },
    //点击提交按钮， 提交成功返回上一页
    async commit() {
      if (!this.value.trim()) {
        uni.showToast({
          title: "请输入反馈信息",
          icon: "none",
        });
        return;
      }
      if (!this.uploadImgs.length) {
        uni.showToast({
          title: "请上传反馈图片",
          icon: "none",
        });
        return;
      }
      // 发送请求
      this.checkedInfo.feedbackPicture = this.uploadImgs.join(",");
      this.checkedInfo.feedbackDescribe = this.value;
      delete this.checkedInfo.version;
      const result = await sendFeedback(this.checkedInfo);
      if (result.data.code == 200) {
        uni.showToast({
          title: "提交成功",
          icon: "success",
        });
        setTimeout(()=>{
          uni.navigateBack({
          delta: 1
          });
        }, 300)
      } else {
        uni.showToast({
          title: "提交失败",
          icon: "none",
        });
      }
    },
  },
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
    width: 100%;
    flex: 1;
    padding: 0 10rpx;
    display: flex;
    flex-direction: column;
    .checkInfo {
      flex: 5;
      width: 100%;
      margin: 10rpx 0;
      background-color: #fff;
      border-radius: 5rpx;
      .checker {
        margin-top: 20rpx;
        .role {
          margin-left: 10rpx;
        }
      }
      .checkedTime {
        margin-top: 20rpx;
        .time {
          margin-left: 10rpx;
        }
      }
      .state_wrap{
        margin-top: 20rpx;
        .state{
          margin-left: 10rpx;
        }
      }
      .des_content {
        margin-top: 20rpx;
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
        margin-top: 40rpx;
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
      flex: 6;
      width: 100%;
      background-color: #fff;
      border-radius: 5rpx;
      padding: 0 8rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      .fb_title {
        .icon {
          color: red;
        }
        .tip {
          color: #666;
          font-size: 26rpx;
        }
      }
      .des_content {
        width: 100%;
        height: 25%;
        border: 1rpx solid #ccc;
        border-radius: 10rpx;
        font-size: 30rpx;
        padding: 20rpx;
        textarea {
          width: 100%;
          height: 100%;
        }
      }
      .fb_imges {
        width: 100%;
        height: 35%;
        display: flex;
        align-items: center;
        padding-left: 60rpx;
        border: 1rpx solid #ccc;
        border-radius: 10rpx;
        button {
          width: 120rpx;
          height: 120rpx;
          padding: 0;
          margin: 0;
          line-height: 120rpx;
          text-align: center;
          font-size: 60rpx;
          color: #ccc;
        }
        .img_wrap {
          margin-left: 40rpx;
        }
      }
    }
    .btn_wrap {
      flex: 1;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10rpx;
      background-color: #fff;
      button {
        width: 60%;
        height: 80rpx;
        font-size: 32rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
      }
    }
  }
}
</style>