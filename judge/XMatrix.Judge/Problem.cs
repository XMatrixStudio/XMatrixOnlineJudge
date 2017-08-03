using MongoDB.Bson;
using MongoDB.Driver;

namespace XMatrix.Judge {
    public class Problem {
        public ObjectId _id;
        public int pid;
        public string pname;
        public int[] grades;
        public BsonDocument[] ranks;
    }
}
