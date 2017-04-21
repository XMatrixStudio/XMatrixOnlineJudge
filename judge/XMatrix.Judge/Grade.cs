using System.IO;
using Newtonsoft.Json;

namespace XMatrix
{
    public class Grade
    {
        public int pid;
        public string compile;
        public string result;

        public Grade(int _pid, string _compilePath, bool _result)
        {
            using (StreamReader sr = File.OpenText(_compilePath))
            {
                compile = sr.ReadToEnd();
            }
            pid = _pid;
            if (compile == string.Empty)
            {
                if (_result == true)
                {
                    result = "Accept.";
                }
                else
                {
                    result = "Wrong Answer.";
                }
            }
            else
            {
                result = "Compile Error.";
            }
        }

        public bool Json(string path)
        {
            using (StreamWriter sw = File.CreateText(path))
            {
                sw.Write(JsonConvert.SerializeObject(this));
                return true;
            }
        }
    }
}