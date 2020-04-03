<template>
  <header class="navbar" :class="{'home-navbar': isHomeNavbar}">
    <SidebarButton @toggle-sidebar="$emit('toggle-sidebar')"/>
    <router-link
      :to="$localePath"
      class="home-link"
    >
      <img
        class="logo"
        v-if="$site.themeConfig.logo"
        :src="$withBase($site.themeConfig.logo)"
        :alt="$siteTitle"
      >
    </router-link>
    <div
      class="links"
      :style="linksWrapMaxWidth ? {
        'max-width': linksWrapMaxWidth + 'px'
      } : {}"
    >
      <SearchBox placeholder="搜索" v-if="$site.themeConfig.search !== false && $page.frontmatter.search !== false"/>
      <NavLinks class="can-hide"/>
    </div>
  </header>
</template>

<script>
import AlgoliaSearchBox from '@AlgoliaSearchBox'
import SearchBox from '@theme/components/SearchBox.vue'
import SidebarButton from '@theme/components/SidebarButton.vue'
import NavLinks from '@theme/components/NavLinks.vue'

export default {
  components: { SidebarButton, NavLinks, SearchBox, AlgoliaSearchBox },

  data () {
    return {
      linksWrapMaxWidth: null
    }
  },

  mounted () {
    const MOBILE_DESKTOP_BREAKPOINT = 719 // refer to config.styl
    const NAVBAR_VERTICAL_PADDING = parseInt(css(this.$el, 'paddingLeft')) + parseInt(css(this.$el, 'paddingRight'))
    const handleLinksWrapWidth = () => {
      if (document.documentElement.clientWidth < MOBILE_DESKTOP_BREAKPOINT) {
        this.linksWrapMaxWidth = null
      } else {
        this.linksWrapMaxWidth = this.$el.offsetWidth - NAVBAR_VERTICAL_PADDING
          - (this.$refs.siteName && this.$refs.siteName.offsetWidth || 0)
      }
    }
    handleLinksWrapWidth()
    window.addEventListener('resize', handleLinksWrapWidth, false)
  },

  computed: {
    algolia () {
      return this.$themeLocaleConfig.algolia || this.$site.themeConfig.algolia || {}
    },

    isAlgoliaSearch () {
      return this.algolia && this.algolia.apiKey && this.algolia.indexName
    },
    isHomeNavbar() {
      return this.$route.path === this.$localePath
    }
  }
}

function css (el, property) {
  // NOTE: Known bug, will return 'auto' if style value is 'auto'
  const win = el.ownerDocument.defaultView
  // null means not to return pseudo styles
  return win.getComputedStyle(el, null)[property]
}
</script>

<style lang="stylus">
$navbar-vertical-padding = 0.7rem
$navbar-horizontal-padding = 1.5rem
$home-navbar-horizontal-padding = 12%

.navbar
  line-height $navbarHeight - 1.4rem
  padding 0 $navbar-horizontal-padding
  span, img
    display inline-block
  .home-link
    display inline-block
    margin-top 0.9rem
    .logo
      height $navbarHeight - 1.8rem
      min-width $navbarHeight - 1.4rem
      margin-right 0.8rem
      vertical-align top
  .links
    height 100%
    padding-left 1.5rem
    box-sizing border-box
    background-color white
    white-space nowrap
    font-size 0.9rem
    position absolute
    right $navbar-horizontal-padding
    top 0
    display flex
    align-items center
    .search-box
      flex: 0 0 auto
      vertical-align top
      input
        background-color $borderColor
        background-position right 0.7rem top 50%
        border none
  &.home-navbar
    padding 0 $home-navbar-horizontal-padding
    .links
      right $home-navbar-horizontal-padding

@media (max-width: $MQMobile)
  .navbar
    padding-left 4rem
    &.home-navbar
      padding-left 4rem
    .links
      justify-content flex-end
    .can-hide
      display none
    .links
      padding-left 1.5rem
</style>
