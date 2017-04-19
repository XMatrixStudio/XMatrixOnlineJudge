using System;
using System.IO;
using System.Text;

namespace judge
{
    public class Compare
    {
        /// <summary>
        /// Compare two txt files by string.
        /// </summary>
        /// <param name="src">standard file</param>
        /// <param name="dest">output file</param>
        /// <returns>result</returns>
        public bool FileStringCompare(string src, string dest)
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
