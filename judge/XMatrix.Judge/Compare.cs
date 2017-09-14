/*
  Copyright (c) 2017 XMatrix Studio
  Licensed under the MIT license

  Description: 对比类
 */

using System.IO;

namespace XMatrix.Judge {
  public class Compare {
    public string std_input;
    public string std_output;
    public string your_output;


    public Compare(string in_path, string std_path, string your_path) {
      using (StreamReader in_sr = File.OpenText(in_path)) {
        std_input = in_sr.ReadToEnd();
      }
      using (StreamReader std_sr = File.OpenText(std_path)) {
        std_output = std_sr.ReadToEnd();
      }
      using (StreamReader your_sr = File.OpenText(your_path)) {
        your_output = your_sr.ReadToEnd();
      }
    }

    public bool FileStringCompare() {
      return std_output == your_output;
    }

    public bool FileFormatCompare() {
      string std = System.Text.RegularExpressions.Regex.Replace(std_output, "[ \r\n\t]", "");
      string your = System.Text.RegularExpressions.Regex.Replace(your_output, "[ \r\n\t]", "");
      return std == your;
    }
  }
}
