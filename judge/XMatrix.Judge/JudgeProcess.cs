using System;
using System.IO;
using Shell.NET;
using MongoDB.Bson;
using MongoDB.Driver;

namespace XMatrix.Judge {
    public class JudgeProcess {
        Problem problem;
        JudgeCase judge_case;

        public JudgeProcess(string _id) {
            var client = new MongoClient(Config.MongoLink);
            var db = client.GetDatabase(Config.DataBase);
            var collection = db.GetCollection<JudgeCase>("judge");
            judge_case = collection.Find(Builders<JudgeCase>.Filter.Eq("_id", new ObjectId(_id))).ToList()[0];

            Console.WriteLine("name is " + judge_case.userName);
        }

        public bool DoJudge() {
            return true;
        }
    }
}
