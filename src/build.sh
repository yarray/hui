for f in `ls stylesheets/*.less | grep -v stylesheets/_`
do
    fname=`basename $f`
    lessc $f stylesheets/dist/${fname%.*}.css
done
