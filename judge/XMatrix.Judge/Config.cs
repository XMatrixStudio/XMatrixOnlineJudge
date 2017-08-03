using System.IO;
using Newtonsoft.Json;

namespace XMatrix.Judge {    
    public class Config {
        public static string MongoLink;
        public static string DataBase;
        public static string CodePath;
        public static string IOPath;
        public static string SandboxPath;

        public static void DoConfig(string path) {
            string json;
            using (StreamReader sr = new StreamReader(path)) {
                json = sr.ReadToEnd();
            }
            TmpConfig config = JsonConvert.DeserializeObject<TmpConfig>(json);
            MongoLink = config.MongoLink;
            DataBase = config.DataBase;
            CodePath = config.CodePath;
            IOPath = config.IOPath;
            SandboxPath = config.SandboxPath;
        }
    }

    public class TmpConfig {
        public string MongoLink;
        public string DataBase;
        public string CodePath;
        public string IOPath;
        public string SandboxPath;
    }
}