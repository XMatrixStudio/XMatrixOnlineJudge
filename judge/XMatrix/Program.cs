/*
  Copyright (c) 2017 XMatrix Studio
  Licensed under the MIT license

  Description: XMOJ的入口函数
 */

using System;
using System.IO;
using System.Diagnostics;
using Newtonsoft.Json;
using XMatrix.Judge;

namespace XMatrix {
    class Program {
        static void Main(string[] args) {
            Config.DoConfig(@"./config/config.json");
            int jid;
            switch (args.Length) {
                case 0:
                    Console.WriteLine("XMOJ: No parameter.");
                    break;
                case 1:
                    args[0] = "59828e74a1b06bbc8f77283a";
                    var judge = new JudgeProcess(args[0]);
                    judge.DoJudge();
                    break;
                default:
                    Console.WriteLine("XMOJ: Redundant parameter.");
                    break;
            }
        }
    }
}
