using System.IO;
using Newtonsoft.Json;

namespace XMatrix
{
    public class Grade
    {
        public int uid;
        public int pid;
        public string compile;
        public string[] result;

        public Grade(int _uid, int _pid, int _std_test_num)
        {
            uid = _uid;
            pid = _pid;
            result = new string[_std_test_num];
        }

        public void SetCompile(string _compile)
        {
            compile = _compile;
        }

        public void SetResult(int _index, string _result)
        {
            result[_index] = _result;
        }

        public bool ToJson(string path)
        {
            using (StreamWriter sw = File.CreateText(path))
            {
                sw.Write(JsonConvert.SerializeObject(this));
                return true;
            }
        }
    }
}