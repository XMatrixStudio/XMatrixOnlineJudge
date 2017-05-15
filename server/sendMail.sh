#!/bin/sh
name=$1
cat test.txt |mutt -s "【Xmatrix】注册邮箱激活" -e 'set content_type="text/html"' ${name}

