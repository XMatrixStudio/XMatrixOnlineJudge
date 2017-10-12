<template>
  <div>
    <el-row :gutter="20" class="report">
      <el-col :span="8">
        <el-card class="progressbox">
          <div slot="header" class="clearfix">
            <span>你的成绩</span><span class="gradetext" :style="'color:' + gradeColor">{{report.grade}}</span>
          </div>
          <p class="usergrade">
            <el-progress type="circle" :percentage="report.grade" :status="gradeStage"></el-progress>
          </p>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="reportcard">
          <div slot="header" class="clearfix">
            <span>评测信息</span>
          </div>
          <p>
            <span class="tiptext">提交时间</span>
            <span>{{report.time}}</span>
          </p>
          <p>
            <span class="tiptext">运行时间</span>
            <span>{{report.runtime}}ms</span>
          </p>
          <p>
            <span class="tiptext">内存占用</span>
            <span>{{report.memory}}KB</span>
          </p>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="report">
      <el-card v-for="(detail,index) in  report.details" :key="index" class="report">
        <div slot="header" class="clearfix">
          <span class="reporttitle">{{detail.title}}</span>
          <span class="reportgrade" :style="'color:' + detail.color">{{detail.userGrade}}/{{detail.maxGrade}}</span>
        </div>
        <div v-if="detail.userGrade !== detail.maxGrade">
          <p>输入：</p>
          <div class="textBox">
            <pre class="myPre">{{detail.input}}</pre>
          </div>
          <p>标准输出：</p>
          <div class="textBox">
            <pre class="myPre">{{detail.output}}</pre>
          </div>
          <p>你的输出：</p>
          <div class="textBox">
            <pre class="myPre">{{detail.userOutput}}</pre>
          </div>
        </div>
        <div v-else>
          通过
        </div>
      </el-card>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      report: {
        time: '2017-10-11 12:11:44',
        runtime: 233,
        memory: 1200,
        grade: 95,
        details: [{
          title: '标准测试',
          maxGrade: 60,
          userGrade: 60,
          input: '1\n2 3 \n4 5 6\n',
          output: '1\n2 3 \n4 5 6\n',
          userOutput: '1\n2 3 \n4 5 6\n',
          color: 'green',
        }, {
          title: '随机测试',
          maxGrade: 40,
          userGrade: 35,
          input: '1\n2 3 \n4 5 6\n',
          output: '1\n2 3 \n4 5 6\n',
          userOutput: '2\n2 3 \n4 5 6\n\n',
          color: 'red',
        }]
      }
    }
  },
  computed: {
    gradeStage() {
      return this.report.grade === 100 ? 'success' : 'exception';
    },
    gradeColor() {
      return this.report.grade === 100 ? 'green' : 'red';
    }
  },
  methods: {
  },
  mounted() {
  }
};
</script>

<style lang="scss">
.reporttitle {
  font-size: 20px;
}

.reportgrade {
  font-size: 17px;
  float: right;
}

.textBox {
  border-radius: 3px;
  background: #000;
  padding: 3px 10px;
}

.myPre {
  color: #fff;
}

.report {
  margin-bottom: 20px;
}

.usergrade {
  text-align: center;
  font-size: 50px;
  margin: -2px;
}

.progressbox{
  .el-card__body {
    padding-top: 32px;
    padding-bottom: 8px;
  }
  .gradetext{
    float: right;
  }
  .clearfix{
    font-size: 23px;
  }
}
.reportcard{
  .clearfix{
    font-size: 23px;
  }

}
.tiptext {
  color: gray;
  margin-right: 20px;
}
</style>
