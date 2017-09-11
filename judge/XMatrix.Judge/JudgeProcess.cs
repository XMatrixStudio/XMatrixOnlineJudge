/*
  Copyright (c) 2017 XMatrix Studio
  Licensed under the MIT license

  Description: 评测进程
 */

using System;
using System.IO;
using Shell.NET;
using MongoDB.Bson;
using MongoDB.Driver;
using XMatrix.DB;

namespace XMatrix.Judge {
    public class JudgeProcess {
        ProblemCase problem_case;
        JudgeCase judge_case;

        public JudgeProcess(string _id) {
            var client = new MongoClient(Config.MongoLink);
            var db = client.GetDatabase(Config.DataBase);
            var judge_collection = db.GetCollection<JudgeCase>("judge");
            judge_case = judge_collection.Find(Builders<JudgeCase>.Filter.Eq("_id", new ObjectId(_id))).FirstOrDefault();
            var problem_collection = db.GetCollection<ProblemCase>("problem");
            problem_case = problem_collection.Find(Builders<ProblemCase>.Filter.Eq("pid", judge_case.pid)).FirstOrDefault();
        }

        public bool DoJudge() {
            var bash = new Bash();
            switch (judge_case.lang) {
                case "C++14": {
                    string cmd = string.Format(@"g++ {0}{1}.cpp -std=c++14 -Wall -o {2}{1}.out", Config.CodePath, judge_case.jid, Config.SandboxPath);
                    var result = bash.Command(cmd);
                    if (result.ExitCode != 0) {
                        Console.WriteLine(result.ErrorMsg);
                    }
                    break;
                }
            }
            return true;
        }
    }
}
