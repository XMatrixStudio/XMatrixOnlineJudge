using System.IO;

namespace XMatrix.Judge
{
    public class Compare
    {
        public static bool FileStringCompare(string src, string dest)
        {
            using (StreamReader srcSR = File.OpenText(src))
            {
                using (StreamReader destSR = File.OpenText(dest))
                {
                    src = srcSR.ReadToEnd();
                    dest = destSR.ReadToEnd();
                    if (src != dest)
                    {
                        return false;
                    }
                    else
                    {
                        return true;
                    }
                }
            }
        }
    }
}
