@echo off
REM ==========================================
REM Iniciar RabbitMQ Local (sem admin)
REM ==========================================

echo.
echo Iniciando RabbitMQ...
echo.

REM Caminho para suas extrações (EDITE AQUI COM O CAMINHO CORRETO)
set ERLANG_PATH=C:\Users\Manoel\Desktop\erlang\bin
set RABBITMQ_PATH=C:\Users\Manoel\Desktop\rabbitmq\sbin

REM Adicionar ao PATH
set PATH=%ERLANG_PATH%;%RABBITMQ_PATH%;%PATH%

REM Iniciar RabbitMQ
echo Verificando Erlang...
erl -version

echo.
echo ==========================================
echo Iniciando servidor RabbitMQ...
echo ==========================================
echo.
echo Aguarde 10 segundos para o servidor iniciar...
echo.

REM Iniciar o servidor RabbitMQ
rabbitmq-server.bat

echo.
echo ✓ RabbitMQ iniciado!
echo.
echo Dashboard: http://localhost:15672
echo Login: guest / guest
echo.
echo Este terminal precisa ficar ABERTO!
echo.

pause