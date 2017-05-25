#!/bin/sh

uid=$1
pid=$2
scase=$3
cd judge
dotnet xmatrix.dll ${uid} ${pid} ${scase}
