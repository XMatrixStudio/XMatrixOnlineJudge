/*
  Copyright (c) 2017 XMatrix Studio
  Licensed under the MIT license

  Description: 问题的数据库描述
 */

using MongoDB.Bson;

namespace XMatrix.DB {
    class ProblemCase {
        public ObjectId _id;
        public int pid;  // 问题id
        public string type;  // 问题类型 [编程题]
        public string category;  // 问题分类 [Zhenly推荐的题目]
        public string title;  // 标题
        public int timeLimit;  // 时间限制
        public int memoryLimit;  // 内存限制
        public string authorName;  // 作者名称
        public int ACCounts;  // 通过数
        public int judgeCounts;  // 总评测数
        public BsonArray rank;  // 排行榜
        // rank: [{ uName:String, grade:Number, submitTime:Date, runTime:Number, memoryUsage:Number }]
        public BsonArray test;  // 评测项目以及分数
        // test: [{ name:String, grade:Number }]
    }
}
