@echo off
echo Testing XP Price API performance with caching...
echo.

echo Call 1:
curl -w "Response time: %%{time_total}s\n" -o NUL -s http://localhost:5000/api/xp-price
timeout /t 1 /nobreak > NUL

echo Call 2:
curl -w "Response time: %%{time_total}s\n" -o NUL -s http://localhost:5000/api/xp-price
timeout /t 1 /nobreak > NUL

echo Call 3:
curl -w "Response time: %%{time_total}s\n" -o NUL -s http://localhost:5000/api/xp-price
timeout /t 1 /nobreak > NUL

echo Call 4:
curl -w "Response time: %%{time_total}s\n" -o NUL -s http://localhost:5000/api/xp-price
timeout /t 1 /nobreak > NUL

echo Call 5:
curl -w "Response time: %%{time_total}s\n" -o NUL -s http://localhost:5000/api/xp-price

echo.
echo Test completed!
