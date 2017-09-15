<template>
<div id="app">
<navbar></navbar>
 <router-view
 class="view"
 keep-alive
 transition
 transition-mode="out-in">
 </router-view>
 </div>
</template>

<script>
  import navbar from './components/Navbar/Index';
  export default{
    components:{navbar},
  }
</script>
