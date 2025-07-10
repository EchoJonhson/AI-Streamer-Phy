@echo off
echo 正在安装FFmpeg文件...

echo 复制ffmpeg.exe...
copy "ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe" .

echo 复制ffprobe.exe...
copy "ffmpeg-master-latest-win64-gpl-shared\bin\ffprobe.exe" .

echo 复制必要的DLL文件...
copy "ffmpeg-master-latest-win64-gpl-shared\bin\avcodec-62.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\avutil-60.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\avformat-62.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\swresample-6.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\swscale-9.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\avfilter-11.dll" .
copy "ffmpeg-master-latest-win64-gpl-shared\bin\avdevice-62.dll" .

echo.
echo 测试FFmpeg安装...
ffmpeg.exe -version

echo.
echo ✅ FFmpeg安装完成！
echo 现在可以运行: python run.py
pause 