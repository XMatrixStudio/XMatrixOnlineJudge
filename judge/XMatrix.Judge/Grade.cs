using System;
using System.IO;
using Newtonsoft.Json;
using MySql.Data;
using MySql.Data.MySqlClient;

namespace XMatrix.Judge
{
    public class Grade
    {
        public int uid;
        public int pid;
        public string compile;
        public string[] result;

        private int std_test_num;
        private int[] grade;
        private int[] grade_ratio;

        private string db = "xmoj";
        private string web = "localhost";
        private string user_id = "xmatrix";
        private string pwd = "";

        public Grade(int _uid, int _pid, int _std_test_num)
        {
            uid = _uid;
            pid = _pid;
            std_test_num = _std_test_num;
            result = new string[std_test_num];
            grade = new int[5] { 0, 0, 0, 0, 0 };
            grade_ratio = new int[4];
            string str_conn = string.Format("Database='{0}';Data Source='{1}';User ID={2};Password={3};CharSet=utf8;", db, web, user_id, pwd);
            string cmd = string.Format("select * from problem where pid={0}", pid);
            MySqlConnection connection = new MySqlConnection(str_conn);
            connection.Open();
            MySqlCommand command = new MySqlCommand(cmd, connection);
            MySqlDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                for (int i = 0; i < 4; i++)
                {
                    grade_ratio[i] = reader.GetInt32(10 + i);
                }

            }
            reader.Close();
            connection.Close();
            grade[4] = grade_ratio[3];
        }

        public void SetCompile(string _compile)
        {
            compile = _compile;
            if (compile == string.Empty)
            {
                grade[1] = grade_ratio[0];
            }
        }

        public void SetResult(int _index, string _result)
        {
            result[_index] = _result;
            if (_result == "Accept")
            {
                grade[2]++;
            }
        }

        public bool ToJson(string path)
        {
            using (StreamWriter sw = File.CreateText(path))
            {
                sw.Write(JsonConvert.SerializeObject(this));
                return true;
            }
        }

        public void ToMySql()
        {
            grade[2] = grade[2] * grade_ratio[1] / std_test_num;
            for (int i = 1; i < 5; i++)
            {
                grade[0] += grade[i];
            }
            string str = "";
            for (int i = 0; i < std_test_num; i++)
            {
                str = string.Format("{0}Case{1}: {2}\\n", str, i, result[i]);
            }
            string str_conn = string.Format("Database='{0}';Data Source='{1}';User ID={2};Password={3};CharSet=utf8;", db, web, user_id, pwd);
            string cmd = string.Format(@"update `xmoj`.`{0}` SET
                `grade` = '{1}', `grade_1` = '{2}', `grade_2` = '{3}', `grade_3` = '{4}', `grade_4` = '{5}',
                `help_text_1` = '{6}', `help_text_2` = '{7}', `help_text_3` = '{8}', `help_text_4` = '{9}',
                `is_judging` = '0' WHERE `{0}`.`pid` = {10};",
                /*0*/ uid, /*1*/ grade[0], /*2*/ grade[1], /*3*/ grade[2], /*4*/ grade[3], /*5*/ grade[4],
                /*6*/ compile, /*7*/ str, /*8*/ string.Empty, /*9*/ string.Empty, /*10*/ pid);
            MySqlConnection connection = new MySqlConnection(str_conn);
            connection.Open();
            MySqlCommand command = new MySqlCommand(cmd, connection);
            MySqlDataReader reader = command.ExecuteReader();
            reader.Close();
            connection.Close();
        }
    }
}
