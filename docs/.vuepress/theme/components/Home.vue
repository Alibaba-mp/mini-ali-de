<template>
  <div class="home" aria-labelledby="main-title">
    <div class=home-main>
      <div class="home-main-description">
        <img :src="fmData.deIcon" alt="de-icon">
        <div class="home-main-title">{{fmData.descriptionTitle}}</div>
        <div class="home-main-content" v-html="fmData.descriptionContent"></div>
        <NavLink
          class="action-button"
          :item="actionLink"
        />
      </div>
      <div class="home-main-pic">
        <img
          class="home-pic"
          @mouseenter="toggleHomeIcon"
          @mouseleave="toggleHomeIcon"
          :src="fmData.homePic"
          alt="home-pic"
        >
        <!-- <img
          class="home-icon"
          @mouseenter="toggleHomeIcon"
          @mouseleave="toggleHomeIcon"
          :class="showHomeIcon ? 'home-icon-show' : 'home-icon-hidden'"
          :src="fmData.homeIcon"
          alt="home-icon"
        > -->
      </div>
    </div>
    <div class="home-egs">
      <h3>典型案例</h3>
      <table>
        <thead>
          <tr>
            <th>蚂蚁森林</th>
            <th>蚂蚁庄园</th>
            <th>公益林</th>
            <th>答答星球</th>
            <th>我的家</th>
            <th>支付宝公益</th>
            <th>来踢球（还有其他BU的...）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*nqotSrKwjhkAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*qL3USbQWNisAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*rG4uQapq4bgAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*u1qzRaKc1CoAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*w-hHQIJldcgAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*TDm0TrIm6EMAAAAAAAAAAABkARQnAQ">
            </td>
            <td>
              <img width="200" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*UEjJSYpEffYAAAAAAAAAAABkARQnAQ">
            </td>
          </tr>
        </tbody>
      </table>
      <h3>金牌服务</h3>
      <div>
        <img width="300" src="https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*B_3UTrnyuw0AAAAAAAAAAABkARQnAQ">
        <!-- <img width="300" src="https://img.alicdn.com/tfs/TB1_ie4d1H2gK0jSZJnXXaT1FXa-1125-1485.jpg_500x500.jpg"> -->
      </div>
    </div>
    <div class="home-footer" v-html="fmData.footer"></div>
  </div>
</template>

<script>
import NavLink from '@theme/components/NavLink.vue'

export default {
  components: { NavLink },
  data() {
    return {
      showHomeIcon: false
    }
  },
  computed: {
    fmData() {
      return this.$page.frontmatter;
    },

    actionLink() {
      return {
        link: this.fmData.actionLink,
        text: this.fmData.actionText
      }
    }
  },
  methods: {
    toggleHomeIcon() {
      this.showHomeIcon = !this.showHomeIcon
    }
  }
}
</script>

<style lang="stylus">
.home
  padding 0 12%
  box-sizing border-box
  .home-main
    display flex
    padding-top 12rem
    margin-bottom 6rem
  .home-main-description
    flex 1
    .home-main-title
      font-size 1.6rem
      margin 1.6rem 0 2rem
    .home-main-content
      font-size 1.2rem
      line-height 2rem
      width 29rem
      margin-bottom 1.2rem
    .action-button
      display inline-block
      font-size 1rem
      color #fff
      background-color $accentColor
      padding 0.7rem 2.3rem
      border-radius 1.4rem
      transition background-color .1s ease
      box-sizing border-box
      border-bottom 1px solid darken($accentColor, 10%)
      &:hover
        background-color lighten($accentColor, 10%)
  .home-main-pic
    flex 1
    position relative
    .home-pic
      width 35rem
    .home-icon
      width 30rem
      position absolute
      right -25px
      top -30px
      &.home-icon-hidden
        opacity 0
        transform translate(10px, 10px)
        transition opacity 0.5s, transform 0.5s
      &.home-icon-show
        opacity 1
        transform translate(-9px, -12px)
        transition opacity 0.5s, transform 0.5s
  .home-egs
    display flex
    flex-direction column
  .home-footer
    width 100%
    text-align: center;
    margin 1.2rem
@media (max-width: $MQMobile)
  .home
    justify-content center
    .home-main
      padding-top 6rem
    .home-main-description
      width 100%
      .home-main-title
        font-size 1.4rem
      .home-main-content
        width 100%
        font-size 1.1rem
      .action-button
        padding 0.7rem 2rem
    .home-main-pic
      display none
    .home-footer
      display none

@media (max-width: $MQMobileNarrow)
  .home
    padding-left 1.5rem
    padding-right 1.5rem
</style>
