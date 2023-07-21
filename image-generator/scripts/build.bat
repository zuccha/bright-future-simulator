SET outdir=.\dist\image_generator

if EXIST %outdir% RMDIR %outdir%

call deno compile --allow-net --allow-read --allow-write --output %outdir%\image_generator main.ts


XCOPY README.txt %outdir% /i
XCOPY config.json %outdir% /i
XCOPY list.csv %outdir% /i
XCOPY images %outdir%\images /e /i
