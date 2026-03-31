Cron Expression Parser

A command-line application that parses a  cron expression
and expands each field to show the times at which it will run.

The parser supports cron expressions with 5 time fields:
minute, hour, day of month, month, day of week.

patterns supported 
- */n
- Single values (e.g. 5)
- Ranges (e.g. 1-5)
- Lists (e.g. 1,3,5)
- Mixed ranges and lists (e.g. 1-5,7,9)

// Does not support 
- Range with step (e.g. 0-23/3)
- Special strings like @yearly

//How to Build
```bash
g++ cron.cpp -o cron


//Example how to run
./cron "*/15 0 1,15 * 1-5 /usr/bin/find"

//Output
minute        0 15 30 45
hour          0
day of month  1 15
month         1 2 3 4 5 6 7 8 9 10 11 12
day of week   1 2 3 4 5
command       /usr/bin/find

