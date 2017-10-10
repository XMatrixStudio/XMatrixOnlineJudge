<template>
  <el-card>
    <p class="selectbox">
      <span>Language:
        <el-select v-model="editorOptions.mode" placeholder="C++ 14">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </span>
      <span class="themebox">Theme:
        <el-select v-model="editorOptions.theme" placeholder="Apple">
          <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </span>
    </p>
    <codemirror v-model="code" :options="editorOptions"></codemirror>
  </el-card>
</template>

<script>
import marked from 'marked';
import { codemirror, CodeMirror } from 'vue-codemirror';
// 导入主题文件
require('../../../node_modules/codemirror/theme/mdn-like.css');
require('../../../node_modules/codemirror/theme/base16-dark.css');
require('../../../node_modules/codemirror/theme/monokai.css');
require('../../../node_modules/codemirror/theme/material.css');
// 导入lang高亮文件
require('../../../node_modules/codemirror/mode/clike/clike.js');
require('../../../node_modules/codemirror/mode/javascript/javascript.js');
// 导入功能
require('../../../node_modules/codemirror/addon/selection/active-line.js');
require('../../../node_modules/codemirror/addon/selection/mark-selection.js');
require('../../../node_modules/codemirror/addon/edit/closebrackets.js');
require('../../../node_modules/codemirror/addon/edit/closetag.js');
require('../../../node_modules/codemirror/addon/edit/continuelist.js');
require('../../../node_modules/codemirror/addon/edit/matchbrackets.js');
require('../../../node_modules/codemirror/addon/edit/matchtags.js');
require('../../../node_modules/codemirror/addon/edit/trailingspace.js');
export default {
  components: {
    codemirror
  },
  data() {
    return {
      code: '#include<stdio.h>\n\nint main() {\n \treturn 0;\n}',
      editorOptions: {
        tabSize: 4,
        mode: 'text/x-c++src',
        theme: 'material',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        inputStyle: 'contenteditable',
        extraKeys: {
          'Ctrl': 'autocomplete'
        },
        autofocus: true,
      },
      options: [{
        value: 'text/x-c++src',
        label: 'C++ 14'
      }, {
        value: 'text/x-csrc',
        label: 'C'
      }, {
        value: 'text/javascript',
        label: 'javascript'
      }, {
        value: 'text/x-csharp',
        label: 'C#'
      }, {
        value: 'text/x-java',
        label: 'java'
      }],
      options2: [{
        value: 'mdn-like',
        label: 'mdn-light'
      }, {
        value: 'monokai',
        label: 'monokai-dark'
      }, {
        value: 'material',
        label: 'material-dark'
      }, {
        value: 'default',
        label: 'default-light'
      }]
    }
  },
  methods: {
  },
  mounted() {
  }
};
</script>

<style lang="scss">
.CodeMirror {
  margin-top: 13px;
  border-radius: 3px;
  height: 500px;
  letter-spacing: 0.5px;
}
.selectbox>span{
  display: inline-block;
  width: 49%;
}
.themebox{
  text-align: right;
}
</style>
