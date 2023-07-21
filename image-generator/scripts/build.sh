outdir=./dist/image_generator

if [ -d $outdir ]; then rm -rf $outdir; fi

deno compile --allow-net --allow-read --allow-write --output $outdir/image_generator main.ts

cp README.txt $outdir
cp config.json $outdir
cp list.csv $outdir
cp -r images $outdir/images
