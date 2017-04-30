#!/bin/bash

QUERY_STRING=1000
STD_TEST_NUM=3

gcc "${QUERY_STRING}.c" > compiler.txt 2>&1

if [ -f "./a.out" ]; then
    for i in {0..$STD_TEST_NUM}
    do
        ./a.out < "./${QUERY_STRING}/in${i}.txt" > "out${i}.txt"
    done
    rm ./a.out
elif [ -f "./a.exe" ]; then
    i=0
    while [ $i -lt $STD_TEST_NUM ]
    do
        ./a.exe < "./${QUERY_STRING}/in${i}.txt" > "out${i}.txt"
        let i+=1
    done
    rm ./a.exe
fi

# build dotnet environment
cd '../judge'
dotnet run 10000 $QUERY_STRING $STD_TEST_NUM
