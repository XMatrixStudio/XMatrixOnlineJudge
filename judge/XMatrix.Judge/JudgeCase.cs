using System;
using System.IO;
using MongoDB.Bson;
using MongoDB.Driver;

namespace XMatrix.Judge {
    public class JudgeCase {
        public ObjectId _id;
        public int jid;
        public int pid;
        public int uid;
        public string userName;
        public int grade;
        public string pname;
        public string lang;
        public BsonDocument[] details;
        public int runTime;
        public BsonDateTime submitTime;
    }
}
