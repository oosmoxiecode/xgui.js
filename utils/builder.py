import os

rev = 1
source = '../dist/xgui.js'
build = '../dist/xgui.min.js'
header = '// xgui.js r' + str( rev ) + ' - https://github.com/oosmoxiecode/xgui.js\n'

os.system( 'java -jar compiler/compiler.jar --language_in=ECMASCRIPT5 --js ' + source + ' --js_output_file ' + build )

file = open( build, 'r' )
contents = file.read();
file.close()

file = open( build, 'w' )
file.write( header + contents )
file.close()
