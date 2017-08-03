# XMatrix OJ Judger

## 数据库储存

评测数据
```json
{
    "jid": 1,  // judge id
    "uid": 100,  // user id
    "username": "Zhenly",  // user name
    "pid": 1,  // problem id
    "pname": "A + B Problem",  // problem title
    "lang": "C++14",
    "result": "Wrong Answer",  // grade
    "details": {
        "Compile Judge": {
            "state": "Compile Succeed",
            "error": "Compile Failed Message"
        },
        "Standard Judge": {
            "state": "Standard Test Succeed",
            "error": [ "in", "out", "your out" ]
        },
        "Random Judge": {
            "state": "Random Test Succeed",
            "error": [ "in", "out", "your out" ]
        }
    }
}
```
