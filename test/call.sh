#!/bin/bash

QUERY_STRING=1000

gcc "${QUERY_STRING}.c" > compiler.txt 2>&1

if [ -f "./a.out" ]; then
    ./a.out < "./${QUERY_STRING}/in.txt" > output.txt
    rm ./a.out
elif [ -f "./a.exe" ]; then
    ./a.exe < "./${QUERY_STRING}/in.txt" > output.txt
    rm ./a.exe
fi

# build dotnet environment
cd '../judge'
dotnet run $QUERY_STRING
