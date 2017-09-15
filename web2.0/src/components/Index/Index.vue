<template>
  <div id="example">
    <h1>{{ msg }}</h1>
    <ul>
      <li v-for="n in 5" :key="n">{{ n }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello World!ZhenlyChen'
    }
  }
}
</script>

<style lang="scss">
#example {
  background: wheat;
  height: 100%;
  width: 100%;
  position:fixed;
}
</style>