#!/usr/bin/ruby

require 'cgi'

cgi = CGI.new

pid = cgi['pid']
code = cgi['code']

file = File.new("#{pid}.c", 'w+')
file.syswrite(code);
file.close

system "./call.sh #{pid}"
