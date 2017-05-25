using System;
using System.IO;
using System.Diagnostics;

namespace XMatrix.Judge
{
    class Shell
    {
        public static void CallShell(string shell_path, string param_list)
        {
            Process shell_process = new Process();
            shell_process.StartInfo.FileName = shell_path;
            shell_process.StartInfo.Arguments = param_list;
            shell_process.Start();
            shell_process.WaitForExit();
        }

        public static bool CallShellWithReIO(string shell_path, string param_list, string reinput_path, string reoutput_path)
        {
            string input_str;
            using (StreamReader sr = File.OpenText(reinput_path))
            {
                input_str = sr.ReadToEnd();
            }
            Process shell_process = new Process();
            shell_process.StartInfo.FileName = shell_path;
            shell_process.StartInfo.Arguments = param_list;
            shell_process.StartInfo.RedirectStandardInput = true;
            shell_process.StartInfo.RedirectStandardOutput = true;
            shell_process.Start();
            shell_process.StandardInput.Write(input_str);
            if (shell_process.WaitForExit(1000))
            {
                string output = shell_process.StandardOutput.ReadToEnd();
                using (StreamWriter sw = File.CreateText(reoutput_path))
                {
                    sw.Write(output);
                }
                return true;
            }
            else
            {
                shell_process.Kill();
                return false;
            }
        }

        public static bool CallShellWithReE(string shell_path, string param_list, string reerror_path)
        {
            Process shell_process = new Process();
            shell_process.StartInfo.FileName = shell_path;
            shell_process.StartInfo.Arguments = param_list;
            shell_process.StartInfo.RedirectStandardError = true;
            shell_process.Start();
            if (shell_process.WaitForExit(5000))
            {
                string error = shell_process.StandardError.ReadToEnd();
                using (StreamWriter sw = File.CreateText(reerror_path))
                {
                    sw.Write(error);
                }
                return true;
            }
            else
            {
                shell_process.Kill();
                return false;
            }
        }
    }
}