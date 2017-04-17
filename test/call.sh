#!/bin/bash

# QUERY_STRING=1

gcc "${QUERY_STRING}.c" > compiler.txt 2>&1

# build dotnet environment
cd '../judge'
dotnet restore
dotnet run $QUERY_STRING
