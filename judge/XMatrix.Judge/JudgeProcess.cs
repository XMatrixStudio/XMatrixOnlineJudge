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
      switch (judge_case.lang) {
        case "C++14":
          JudgeCPP14();
          break;
      }

      return true;
    }

    private void JudgeCPP14() {
      var bash = new Bash();
      string cmd = $"g++ {Config.CodePath}{judge_case.jid}.cpp -std=c++14 -Wall -o {Config.SandboxPath}{judge_case.jid}.out";
      var result = bash.Command(cmd);
      judge_case.details = new BsonDocument[4];
      if (result.ExitCode != 0) {
        judge_case.details[0] = new BsonDocument {
          { "name", "compile"},
          { "grade", 0 },
          { "text", result.ErrorMsg }
        };
      } else {
        judge_case.details[0] = new BsonDocument {
          { "name", "compile"},
          { "grade", Array.Find(problem_case.test, x => x.GetValue("name") == "compile").GetValue("val") }
        };
      }
      var standard_test = Array.Find(problem_case.test, x => x.GetValue("name") == "standard-test");
      if (standard_test != null) {
        judge_case.details[1] = new BsonDocument {
          { "name", "standard-test" }
        };
        int grade = 0;
        for (int i = 0; i < standard_test.GetValue("num"); i++) {
          cmd = $"{Config.SandboxPath}{judge_case.jid}.out < {Config.IOPath}{judge_case.pid}/in{i}.txt > {Config.SandboxPath}out{i}.txt";
          bash.Command(cmd);
          var compare = new Compare($"{Config.IOPath}{judge_case.pid}/in{i}.txt", $"{Config.IOPath}{judge_case.pid}/out{i}.txt", $"{Config.SandboxPath}out{i}.txt");
          if (compare.FileStringCompare()) {
            grade++;
          } else {
            judge_case.details[1].Add(new BsonElement("io", new BsonDocument{
              { "input", compare.std_input },
              { "output", compare.std_output },
              { "your-output", compare.your_output }
            }));
          }
        }
        judge_case.details[1].Add(new BsonElement("grade", grade / standard_test.GetValue("num").ToInt32()));
      }
    }
  }
}
