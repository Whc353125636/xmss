set VER=1.0.0
set URL=http://nmj.buerkong.com/xmmj-assets/
node version_generator.js -v %VER% -u %URL% -s build/jsb-binary/ -d remote-assets/
copy /Y remote-assets\project.manifest assets\
rmdir /S /Q remote-assets\res
rmdir /S /Q remote-assets\src
xcopy /S build\jsb-binary\res remote-assets\res\
xcopy /S build\jsb-binary\src remote-assets\src\
