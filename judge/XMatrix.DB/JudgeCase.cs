/*
  Copyright (c) 2017 XMatrix Studio
  Licensed under the MIT license

  Description: 评测样例的数据库描述
 */

using MongoDB.Bson;

namespace XMatrix.DB {
    public class JudgeCase {
        public ObjectId _id;
        public int jid;  // 评测id
        public int pid;  // 问题id
        public int uid;  // 用户id
        public string uName;  // 用户名
        public string pName;  // 问题名字
        public int grade;  // 总成绩
        public string lang;  // 编译语言
        public BsonArray[] details;  // 详细评测项目
        // details: [{ name:String, grade:Number, text:String }]
        public int runTime;  // 运行时间
        public int memoryUsage;  // 内存占用
        public bool judging;  // 正在评测
        public BsonDateTime submitTime;  // 提交时间
    }
}
