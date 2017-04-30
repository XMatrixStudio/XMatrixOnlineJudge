using System.IO;

namespace XMatrix.Judge
{
    public class Compare
    {
        private string std_input;
        private string your_input;

        public Compare(string std_path, string your_path)
        {
            using (StreamReader std_sr = File.OpenText(std_path))
            {
                using (StreamReader your_sr = File.OpenText(your_path))
                {
                    std_input = std_sr.ReadToEnd();
                    your_input = your_sr.ReadToEnd();
                }
            }
        }

        public bool FileStringCompare()
        {
            return std_input == your_input;
        }

        public bool FileFormatCompare()
        {
            string std = System.Text.RegularExpressions.Regex.Replace(std_input, "[ \r\n\t]", "");
            string your = System.Text.RegularExpressions.Regex.Replace(your_input, "[ \r\n\t]", "");
            return std == your;
        }
    }
}
