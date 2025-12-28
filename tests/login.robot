*** Settings ***
Library    SeleniumLibrary
Resource    ../resources/common.robot

Suite Setup    Abrir Navegador
Suite Teardown    Cerrar Navegador

*** Test Cases ***
Login exitoso con credenciales válidas
    [Documentation]    Verifica que el usuario pueda iniciar sesión correctamente
    Ingresar credenciales válidas
    Hacer login
    Validar Login Exitoso
    Hacer Logout
    Validar Logout