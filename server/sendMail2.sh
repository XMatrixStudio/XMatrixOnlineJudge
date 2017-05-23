#!/bin/sh
name=$1
cat mail.html |mutt -s "【Xmatrix】邮箱验证码" -e 'set content_type="text/html"' ${name}
